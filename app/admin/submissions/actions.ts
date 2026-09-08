"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guard";
import { STATUSES, type Status } from "@/lib/admin/status";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type NoteState = { status: "idle" | "error"; message?: string };

const MAX_NOTE = 4000;

export async function addNote(_prev: NoteState, formData: FormData): Promise<NoteState> {
  // Re-checked here, not just on the page. A server action is its own entry
  // point and is reachable without ever rendering the page that shows it.
  const author = await requireAdmin();

  const submissionId = String(formData.get("submissionId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!submissionId) return { status: "error", message: "Missing submission." };
  if (!body) return { status: "error", message: "Write something first." };
  if (body.length > MAX_NOTE) {
    return { status: "error", message: `Keep notes under ${MAX_NOTE.toLocaleString()} characters.` };
  }
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Not connected to the database." };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("candidate_notes").insert({
      submission_id: submissionId,
      author_email: author,
      body,
    });
    if (error) throw error;
  } catch (err) {
    console.error("[addNote] failed:", err);
    return { status: "error", message: "Could not save that note. Please try again." };
  }

  revalidatePath(`/admin/submissions/${submissionId}`);
  return { status: "idle" };
}

export async function setStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const submissionId = String(formData.get("submissionId") ?? "");
  const status = String(formData.get("status") ?? "") as Status;

  if (!submissionId || !STATUSES.includes(status)) return;
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("candidate_submissions")
      .update({ status })
      .eq("id", submissionId);
    if (error) throw error;
  } catch (err) {
    console.error("[setStatus] failed:", err);
  }

  revalidatePath(`/admin/submissions/${submissionId}`);
  revalidatePath("/admin");
}
