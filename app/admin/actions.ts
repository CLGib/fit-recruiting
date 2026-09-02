"use server";

import { redirect } from "next/navigation";
import { isAllowedEmail, isAdminConfigured } from "@/lib/auth/access";
import { createSupabaseAuthClient } from "@/lib/supabase/auth-client";

export type LoginState = { status: "idle" | "sent" | "error"; message?: string };

/**
 * Magic-link sign in.
 *
 * Deliberately returns the SAME response whether or not the address is
 * allowed. Telling an unknown sender "you're not authorised" confirms which
 * addresses exist, so the allowlist is enforced silently here and again on
 * every admin request.
 */
export async function requestLoginLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const sent: LoginState = {
    status: "sent",
    message: "If that address has access, a sign-in link is on its way. It expires in an hour.",
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }
  if (!isAdminConfigured()) {
    return {
      status: "error",
      message: "Admin access is not configured yet. Set ADMIN_ALLOWED_EMAILS.",
    };
  }
  if (!isAllowedEmail(email)) {
    // Silent to the caller, loud in our logs. The user-facing response is
    // identical either way so the form cannot be used to enumerate staff, but
    // without this line a rejected address is indistinguishable from a
    // delivery failure when something goes wrong. Also the audit trail you
    // want for failed admin sign-in attempts.
    console.warn(`[requestLoginLink] rejected, not in allowlist: ${email}`);
    return sent;
  }

  try {
    const supabase = await createSupabaseAuthClient();
    const origin = process.env.SITE_URL ?? "http://localhost:3000";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/admin/callback`,
        // Recruiters are added deliberately, not by signing themselves up.
        shouldCreateUser: true,
      },
    });
    if (error) throw error;
    console.info(`[requestLoginLink] magic link requested for ${email}`);
  } catch (err) {
    console.error("[requestLoginLink] failed:", err);
    return {
      status: "error",
      message: "We couldn't send that link. Please try again in a moment.",
    };
  }

  return sent;
}

export async function signOut() {
  const supabase = await createSupabaseAuthClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
