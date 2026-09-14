"use server";

import { requireAdmin } from "@/lib/auth/guard";
import { isAiConfigured } from "@/lib/ai/config";
import { EMPLOYMENT_TYPES, type EmploymentType } from "@/lib/admin/role-status";
import type { JobDescription } from "@/lib/ai/job-description";
import type { ResumeAnalysis } from "@/lib/ai/resume-analysis";
import type { RoleMatch } from "@/lib/ai/role-match-schema";

/**
 * The portal's "API-friendly tools": helpers that work alongside Bullhorn
 * rather than replacing any part of it (Fit, 2026-09-14). Neither saves
 * anything. What comes back is for a recruiter to read, copy, or paste into
 * Bullhorn themselves.
 */

const NO_AI = "The tools are switched off until an Anthropic API key is set on this deployment.";

// ---------------------------------------------------------------------------
// Job description writer
// ---------------------------------------------------------------------------

export type DescriptionState = {
  status: "idle" | "done" | "error";
  message?: string;
  errors?: Record<string, string>;
  description?: JobDescription;
};

export async function writeJobDescription(
  _prev: DescriptionState,
  formData: FormData,
): Promise<DescriptionState> {
  await requireAdmin();

  const str = (k: string) => String(formData.get(k) ?? "").trim();
  const title = str("title");
  const location = str("location");
  const employmentType = str("employment_type") || "Full Time";
  const salary = str("salary");
  const categories = str("categories")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const notes = str("notes");

  const errors: Record<string, string> = {};
  if (!title) errors.title = "What is the role called?";
  if (!location) errors.location = "Where is it based?";
  if (!EMPLOYMENT_TYPES.includes(employmentType as EmploymentType)) {
    errors.employment_type = "Pick an employment type.";
  }
  if (notes.length > 4000) errors.notes = "Keep the notes under 4,000 characters.";
  if (Object.keys(errors).length) {
    return { status: "error", message: "Please check the highlighted fields.", errors };
  }
  if (!isAiConfigured()) return { status: "error", message: NO_AI };

  try {
    const { draftJobDescription } = await import("@/lib/ai/job-description");
    const { description } = await draftJobDescription({
      title,
      location,
      employmentType,
      salary: salary || null,
      categories,
      notes: notes || null,
    });
    return { status: "done", description };
  } catch (err) {
    console.error("[writeJobDescription] failed:", err);
    return { status: "error", message: "The draft could not be written. Please try again." };
  }
}

// ---------------------------------------------------------------------------
// Résumé reviewer
// ---------------------------------------------------------------------------

/**
 * 4 MB, matching the public résumé form: Vercel refuses request bodies over
 * 4.5 MB before this runs. NOT exported: a "use server" module may only
 * export async functions.
 */
const MAX_BYTES = 4 * 1024 * 1024;

export type ReviewState = {
  status: "idle" | "done" | "error";
  message?: string;
  fileName?: string;
  analysis?: ResumeAnalysis;
  match?: RoleMatch | null;
  /** Why there is no role check, when there is not one. */
  matchNote?: string;
  roleTitles?: Record<string, string>;
};

/**
 * Upload a résumé, get the summary and a read against the job board's roles.
 *
 * The roles come from the same place as the public job board: Bullhorn once it
 * is connected, the current roles until then. The file is read in memory and
 * never stored. The summary and the role check run side by side, and the
 * summary is returned even if the role check fails.
 */
export async function reviewResume(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  await requireAdmin();

  const file = formData.get("resume");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose a résumé to review." };
  }
  if (file.size > MAX_BYTES) {
    return { status: "error", message: "That file is larger than 4 MB. Please use a smaller copy." };
  }
  if (file.type !== "application/pdf") {
    return { status: "error", message: "Save the résumé as a PDF first. That is the only format this can read." };
  }
  if (!isAiConfigured()) return { status: "error", message: NO_AI };

  const [{ analyzeResumePdf }, { matchResumeToRoles }, { listActiveJobs }] = await Promise.all([
    import("@/lib/ai/resume-analysis"),
    import("@/lib/ai/role-match"),
    import("@/lib/jobs/source"),
  ]);

  const pdf = Buffer.from(await file.arrayBuffer()).toString("base64");

  let jobs: Awaited<ReturnType<typeof listActiveJobs>> = [];
  let matchNote: string | undefined;
  try {
    jobs = await listActiveJobs();
    if (jobs.length === 0) matchNote = "There are no open roles to check against right now.";
  } catch (err) {
    console.error("[reviewResume] could not load open roles:", err);
    matchNote = "The open roles could not be loaded, so this résumé was not checked against them.";
  }

  const [analysisResult, matchResult] = await Promise.allSettled([
    analyzeResumePdf(pdf, { role: null }),
    jobs.length
      ? matchResumeToRoles(
          pdf,
          jobs.map((j) => ({
            slug: j.slug,
            title: j.title,
            location: j.location,
            summary: j.summary ?? null,
            requirements: j.requirements ?? [],
          })),
        )
      : Promise.resolve(null),
  ]);

  if (analysisResult.status === "rejected") {
    console.error("[reviewResume] summary failed:", analysisResult.reason);
    return {
      status: "error",
      message: "That résumé could not be read. If it is a scan or an image, a text PDF works better.",
    };
  }

  let match: RoleMatch | null = null;
  if (matchResult.status === "fulfilled") {
    match = matchResult.value?.match ?? null;
  } else {
    console.error("[reviewResume] role check failed:", matchResult.reason);
    matchNote = "The check against open roles did not finish. The summary is complete.";
  }

  return {
    status: "done",
    fileName: file.name,
    analysis: analysisResult.value.analysis,
    match,
    matchNote,
    roleTitles: Object.fromEntries(jobs.map((j) => [j.slug, j.title])),
  };
}
