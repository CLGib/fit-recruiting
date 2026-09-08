import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { isSupabaseConfigured, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  decide,
  pickClientIp,
  PER_DAY_TOTAL,
  PER_IP_PER_DAY,
  type LimitResult,
} from "./audit-limit-rules";

export { PER_DAY_TOTAL, PER_IP_PER_DAY, type LimitResult };

const WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Hash the caller's address.
 *
 * Salted so the table cannot be reversed by hashing candidate IPs against it,
 * which is trivial for a 32-bit space. The salt defaults to the service role
 * key: it is server-only, high entropy, and already required for this route to
 * work, so this adds no new deployment step. Set AUDIT_IP_SALT to rotate it
 * independently.
 */
function hashIp(ip: string): string {
  const salt = process.env.AUDIT_IP_SALT ?? SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

async function callerIp(): Promise<string> {
  const h = await headers();
  return pickClientIp(h.get("x-forwarded-for"), h.get("x-real-ip"));
}

/**
 * Check the ceilings and, if there is room, claim a slot.
 *
 * The claim is recorded BEFORE the model runs, not after, so a burst of
 * simultaneous requests cannot all pass a check that each of them then
 * invalidates. It means a failed run still costs the person a slot, which is
 * the right way round: the alternative lets a caller spend money for free by
 * making the call fail.
 *
 * Fails CLOSED when the database is unreachable. An unmetered endpoint that
 * spends money is worse than a review tool that is briefly unavailable, and
 * the caller is told to email instead.
 */
export async function claimAuditSlot(): Promise<LimitResult> {
  if (!isSupabaseConfigured()) return { allowed: false, reason: "unavailable" };

  try {
    const supabase = createSupabaseAdminClient();
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const ipHash = hashIp(await callerIp());

    const [mine, everyone] = await Promise.all([
      supabase
        .from("audit_usage")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", since),
      supabase
        .from("audit_usage")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
    ]);

    if (mine.error || everyone.error) throw mine.error ?? everyone.error;

    const verdict = decide(mine.count ?? 0, everyone.count ?? 0);
    if (!verdict.allowed) return verdict;

    const { error } = await supabase.from("audit_usage").insert({ ip_hash: ipHash });
    if (error) throw error;

    // Housekeeping on the write path rather than a scheduled job: the table
    // only exists to answer "recently", so anything past the window is dead
    // weight, and at this volume the delete is free.
    await supabase
      .from("audit_usage")
      .delete()
      .lt("created_at", new Date(Date.now() - 7 * WINDOW_MS).toISOString());

    return { allowed: true };
  } catch (err) {
    console.error("[claimAuditSlot] failed, refusing the run:", err);
    return { allowed: false, reason: "unavailable" };
  }
}
