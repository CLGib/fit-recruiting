import { redirect } from "next/navigation";
import { isAllowedEmail } from "./access";
import { getSessionUser } from "@/lib/supabase/auth-client";
import { isAdminPreview } from "@/lib/admin/preview";

/**
 * The two gates every admin route must pass.
 *
 * A valid session is not enough on its own: Supabase will issue one to any
 * address that asks for a code, so the allowlist is checked separately and on
 * every request rather than trusted from sign-in time.
 *
 * Returns the signed-in address, or a marker in local preview mode.
 */
export async function requireAdmin(): Promise<string> {
  if (isAdminPreview()) return "preview mode";

  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (!isAllowedEmail(user.email)) redirect("/admin/login?error=denied");
  return user.email ?? "unknown";
}
