import "server-only";

import { RESUME_BUCKET, isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Status } from "./status";

// Stage constants live in ./status so client components can import them
// without pulling this server-only module into the browser bundle.
export type { Status } from "./status";

export type Submission = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  linkedin: string | null;
  role_slug: string | null;
  message: string | null;
  resume_path: string | null;
  resume_filename: string | null;
  status: Status;
};

export type Note = {
  id: string;
  submission_id: string;
  author_email: string;
  body: string;
  created_at: string;
  /** Set once the note has been pushed into Bullhorn. Null until then. */
  bullhorn_note_id: string | null;
};

export async function listSubmissions(): Promise<Submission[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("candidate_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as Submission[];
}

export async function getSubmission(id: string): Promise<Submission | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("candidate_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Submission) ?? null;
}

export async function listNotes(submissionId: string): Promise<Note[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("candidate_notes")
    .select("*")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Note[];
}

/** Counts per status, for the list filter. */
export async function countsByStatus(rows: Submission[]): Promise<Record<string, number>> {
  return rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
}

/**
 * Short-lived signed URL for a résumé. Regenerated per request so a link that
 * leaves the building expires rather than becoming a permanent public copy.
 */
export async function signedResumeUrl(path: string | null): Promise<string | null> {
  if (!path || !isSupabaseConfigured()) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.storage.from(RESUME_BUCKET).createSignedUrl(path, 60 * 10);
  return data?.signedUrl ?? null;
}

export type StoredAnalysis = {
  id: string;
  submission_id: string;
  result: unknown;
  model: string;
  input_tokens: number | null;
  output_tokens: number | null;
  created_at: string;
  created_by: string;
};

export async function getAnalysis(submissionId: string): Promise<StoredAnalysis | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("resume_analyses")
    .select("*")
    .eq("submission_id", submissionId)
    .maybeSingle();
  return (data as StoredAnalysis) ?? null;
}

/** Downloads the résumé and returns it base64 encoded, for the model. */
export async function resumeBase64(path: string | null): Promise<string | null> {
  if (!path || !isSupabaseConfigured()) return null;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(RESUME_BUCKET).download(path);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer()).toString("base64");
}

export type StoredMatch = {
  id: string;
  submission_id: string;
  result: unknown;
  roles_hash: string;
  model: string;
  created_at: string;
  created_by: string;
};

export async function getRoleMatch(submissionId: string): Promise<StoredMatch | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("resume_role_matches")
    .select("*")
    .eq("submission_id", submissionId)
    .maybeSingle();
  return (data as StoredMatch) ?? null;
}

/** Identifies which roles a match run considered, so staleness is visible. */
export function rolesHash(slugs: string[]): string {
  return [...slugs].sort().join(",");
}

export type StoredPresentation = {
  id: string;
  submission_id: string;
  content: unknown;
  model: string;
  created_at: string;
  created_by: string;
};

export async function getPresentation(
  submissionId: string,
): Promise<StoredPresentation | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("presentation_resumes")
    .select("*")
    .eq("submission_id", submissionId)
    .maybeSingle();
  return (data as StoredPresentation) ?? null;
}
