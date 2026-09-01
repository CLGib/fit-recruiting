/**
 * Supabase configuration.
 *
 * Every entry point checks isSupabaseConfigured() first, so the site builds and
 * renders on a machine with no credentials and the apply form degrades to an
 * honest "email or call us" message rather than pretending to have saved a file.
 */

/**
 * Deliberately NOT prefixed NEXT_PUBLIC_. Nothing in this codebase talks to
 * Supabase from the browser, so there is no reason to inline this into the
 * client bundle. Adding the prefix back would expose it to every visitor and,
 * worse, would signal that a browser-side Supabase client is acceptable here.
 * If a client-side client is ever genuinely needed, add a separate
 * NEXT_PUBLIC_SUPABASE_URL alongside an anon/publishable key. Never expose
 * the service role key.
 */
export const SUPABASE_URL = process.env.SUPABASE_URL;

/** Server-only. Bypasses RLS. Never import into a client component. */
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Private bucket holding candidate résumés. Must never be public. */
export const RESUME_BUCKET = process.env.SUPABASE_RESUME_BUCKET ?? "resumes";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}
