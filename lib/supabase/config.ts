/**
 * Supabase environment configuration.
 *
 * Every entry point checks `isSupabaseConfigured()` before touching the client
 * so the site builds and renders correctly on a machine with no credentials —
 * forms degrade to a clear "call us instead" message rather than throwing.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Server-only. Never import this into a client component. */
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** Storage bucket that holds candidate résumé files. Private — never public. */
export const RESUME_BUCKET = "resumes";
