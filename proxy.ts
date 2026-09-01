import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth cookie on admin requests.
 *
 * Named `proxy` rather than `middleware`: the middleware file convention is
 * deprecated in Next 16 and renamed to proxy.
 *
 * Without this a magic-link session silently expires mid-session and the
 * recruiter gets bounced to the login page while working. This only refreshes
 * the token; authorisation is enforced in the pages themselves, which check
 * both a valid session and the email allowlist.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Only the admin area needs session handling. Keeping the public site out of
  // the matcher means no auth work on the pages candidates actually hit.
  matcher: ["/admin/:path*"],
};
