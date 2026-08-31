/**
 * Supabase configuration.
 *
 * Every entry point checks isSupabaseConfigured() first, so the site builds and
 * renders on a machine with no credentials and the apply form degrades to an
 * honest "email or call us" message rather than pretending to have saved a file.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** Server-only. Bypasses RLS. Never import into a client component. */
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Private bucket holding candidate résumés. Must never be public. */
export const RESUME_BUCKET = process.env.SUPABASE_RESUME_BUCKET ?? "resumes";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}
