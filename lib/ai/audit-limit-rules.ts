/**
 * The rate-limit rules for the public résumé review, with no I/O.
 *
 * Separated from audit-limit.ts so they can be run and tested on their own.
 * Both functions here are the kind that are quietly wrong in a lot of
 * codebases and cost nothing to get right once.
 */

export const PER_IP_PER_DAY = Number(process.env.AUDIT_LIMIT_PER_IP ?? 3);
export const PER_DAY_TOTAL = Number(process.env.AUDIT_LIMIT_PER_DAY ?? 100);

export type LimitResult =
  | { allowed: true }
  | { allowed: false; reason: "per_ip" | "per_day" | "unavailable" };

/**
 * Pick the client address out of the proxy headers.
 *
 * Vercel APPENDS the real client address to x-forwarded-for, so the entry to
 * trust is the LAST one. Reading the first is the common mistake, and it hands
 * the limit to anyone willing to set the header themselves.
 */
export function pickClientIp(
  forwarded: string | null,
  realIp: string | null,
): string {
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return realIp ?? "unknown";
}

/**
 * Whether this run is allowed, given how many have happened in the window.
 *
 * The per-address ceiling is checked first: when both are hit, that is the
 * more useful thing to tell the person in front of you.
 */
export function decide(mine: number, everyone: number): LimitResult {
  if (mine >= PER_IP_PER_DAY) return { allowed: false, reason: "per_ip" };
  if (everyone >= PER_DAY_TOTAL) return { allowed: false, reason: "per_day" };
  return { allowed: true };
}
