import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL } from "./config";

/**
 * Request-scoped client carrying the signed-in recruiter's session.
 *
 * Uses the ANON/publishable key, never the service role: this client acts as
 * the user and is subject to row level security. The service role client in
 * ./server.ts is only for the anonymous public write path.
 */
export async function createSupabaseAuthClient() {
  const url = SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Admin auth needs SUPABASE_URL and SUPABASE_ANON_KEY.");
  }

  const store = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component; middleware refreshes the session.
        }
      },
    },
  });
}

/** The signed-in user, or null. Never throws for an unconfigured project. */
export async function getSessionUser() {
  try {
    const supabase = await createSupabaseAuthClient();
    // getUser() revalidates against Supabase rather than trusting the cookie.
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  } catch {
    return null;
  }
}
