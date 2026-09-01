import { NextResponse } from "next/server";
import { isAllowedEmail } from "@/lib/auth/access";
import { createSupabaseAuthClient } from "@/lib/supabase/auth-client";

/**
 * Magic-link landing point. Exchanges the code for a session, then re-checks
 * the allowlist: a link could have been issued before someone was removed, and
 * authentication is not authorisation.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=missing_code`);
  }

  const supabase = await createSupabaseAuthClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !isAllowedEmail(data?.user?.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/admin/login?error=denied`);
  }

  return NextResponse.redirect(`${origin}/admin`);
}
