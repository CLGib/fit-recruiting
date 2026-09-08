"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guard";
import { STATUSES, type Status } from "@/lib/admin/status";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isAiConfigured } from "@/lib/ai/config";
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

export type AnalyzeState = { status: "idle" | "error"; message?: string };

/**
 * Run the résumé briefing.
 *
 * Deliberately on demand rather than on upload: each run costs real money, and
 * most submissions never need one. The result is cached so a recruiter opening
 * the record again does not pay for it twice.
 */
export async function analyzeResume(
  _prev: AnalyzeState,
  formData: FormData,
): Promise<AnalyzeState> {
  // A server action is its own entry point, reachable without the page.
  const author = await requireAdmin();

  const submissionId = String(formData.get("submissionId") ?? "");
  if (!submissionId) return { status: "error", message: "Missing submission." };
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Not connected to the database." };
  }
  if (!isAiConfigured()) {
    return { status: "error", message: "No Anthropic API key is set on this deployment." };
  }

  const { getSubmission, resumeBase64 } = await import("@/lib/admin/submissions");
  const { analyzeResumePdf, isAnalyzable } = await import("@/lib/ai/resume-analysis");

  const submission = await getSubmission(submissionId);
  if (!submission) return { status: "error", message: "That submission no longer exists." };
  if (!isAnalyzable(submission.resume_filename, submission.resume_path)) {
    return { status: "error", message: "Briefings read PDFs only." };
  }

  try {
    const pdf = await resumeBase64(submission.resume_path);
    if (!pdf) throw new Error("Could not read the résumé file from storage.");

    const { analysis, model, inputTokens, outputTokens } = await analyzeResumePdf(pdf, {
      role: submission.role_slug,
    });

    const supabase = createSupabaseAdminClient();
    // Upsert on submission_id so re-running replaces rather than accumulates.
    const { error } = await supabase.from("resume_analyses").upsert(
      {
        submission_id: submissionId,
        result: analysis,
        model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        created_by: author,
        created_at: new Date().toISOString(),
      },
      { onConflict: "submission_id" },
    );
    if (error) throw error;
  } catch (err) {
    // Detail goes to the logs; the recruiter gets something actionable. A
    // failed briefing must never stop anyone reading the résumé themselves.
    console.error("[analyzeResume] failed:", err);
    return {
      status: "error",
      message: "The briefing could not be generated. Open the résumé directly, and try again later.",
    };
  }

  revalidatePath(`/admin/submissions/${submissionId}`);
  return { status: "idle" };
}
