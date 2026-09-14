import { redirect } from "next/navigation";
import { isAllowedEmail } from "./access";
import { getPinSessionEmail } from "./pin";
import { getSessionUser } from "@/lib/supabase/auth-client";
import { isAdminPreview } from "@/lib/admin/preview";

/**
 * The gates every admin route must pass.
 *
 * A valid session is not enough on its own: Supabase will issue one to any
 * address that asks for a code, so the allowlist is checked separately and on
 * every request rather than trusted from sign-in time.
 *
 * Two kinds of session count: a Supabase one (emailed code), or the temporary
 * test PIN session from lib/auth/pin.ts, which only exists while
 * ADMIN_TEST_PIN is set. Both must belong to an allowed address.
 *
 * Returns the signed-in address, or a marker in local preview mode.
 */
export async function requireAdmin(): Promise<string> {
  if (isAdminPreview()) return "preview mode";

  const user = await getSessionUser();
  if (user) {
    if (!isAllowedEmail(user.email)) redirect("/admin/login?error=denied");
    return user.email ?? "unknown";
  }

  const pinEmail = await getPinSessionEmail();
  if (pinEmail && isAllowedEmail(pinEmail)) return pinEmail;

  redirect("/admin/login");
}
