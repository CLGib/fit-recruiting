import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Service-role client. BYPASSES ROW LEVEL SECURITY.
 *
 * This is correct here and only here: an anonymous applicant must be able to
 * write a submission they can never read back. There is no signed-in user in
 * this scope, so there is no user-scoped client. Keep this server-only.
 */
export function createSupabaseAdminClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
