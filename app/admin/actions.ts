"use server";

import { redirect } from "next/navigation";
import { isAllowedEmail, isAdminConfigured } from "@/lib/auth/access";
import { clearPinSession, createPinSession, isPinEnabled, pinMatches } from "@/lib/auth/pin";
import { createSupabaseAuthClient } from "@/lib/supabase/auth-client";

export type LoginState = {
  status: "idle" | "sent" | "error";
  message?: string;
  /** Carried through so the code step knows which address to verify. */
  email?: string;
};

export type VerifyState = { status: "idle" | "error"; message?: string };
export type PinState = { status: "idle" | "error"; message?: string };

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
    email,
    message:
      "If that address has access, a sign-in code is on its way. It expires in an hour.",
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

/**
 * Sign in with the temporary test PIN. See lib/auth/pin.ts for why it exists
 * and how it is switched off.
 *
 * The allowlist still applies. Every failure gets the same message, so the
 * form cannot be used to learn which addresses have access, and a short pause
 * after each wrong attempt makes guessing a short PIN slow. The PIN is never
 * logged.
 */
export async function signInWithPin(_prev: PinState, formData: FormData): Promise<PinState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const pin = String(formData.get("pin") ?? "");

  if (!isPinEnabled()) {
    return { status: "error", message: "PIN sign-in is turned off. Use an emailed code instead." };
  }
  if (!email || !pin) {
    return { status: "error", message: "Enter your email and PIN." };
  }
  if (!isAllowedEmail(email) || !pinMatches(pin)) {
    console.warn(`[signInWithPin] failed for ${email}`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { status: "error", message: "That email and PIN don't match." };
  }

  await createPinSession(email);
  console.info(`[signInWithPin] signed in: ${email}`);
  // Outside any try: redirect() signals by throwing, and must not be caught.
  redirect("/admin");
}

export async function signOut() {
  // The PIN session first: it needs nothing external, so it always clears.
  await clearPinSession();
  try {
    const supabase = await createSupabaseAuthClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[signOut] Supabase sign-out failed:", err);
  }
  redirect("/admin/login");
}

/**
 * Step two: verify the emailed code.
 *
 * Preferred over clicking the magic link. A code cannot be consumed by a
 * corporate email scanner pre-fetching URLs, and it does not depend on the
 * Supabase redirect allowlist or on the link being opened in the same browser
 * that requested it.
 */
export async function verifyLoginCode(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("token") ?? "").replace(/\s/g, "");

  // Supabase's code length is a project setting (6 to 10 digits), and this
  // project sends 8. Hardcoding 6 rejected every real code as invalid.
  if (!/^\d{6,10}$/.test(token)) {
    return { status: "error", message: "Enter the code from your email." };
  }
  // Re-check: the address could have been removed since the code was sent.
  if (!isAllowedEmail(email)) {
    return { status: "error", message: "That code is not valid." };
  }

  try {
    const supabase = await createSupabaseAuthClient();

    // Codes reach us two ways and Supabase types them differently:
    // signInWithOtp issues "email", admin.generateLink issues "magiclink".
    // Try both so a phone-issued code works in the same box.
    let user = null;
    for (const type of ["email", "magiclink"] as const) {
      const { data, error } = await supabase.auth.verifyOtp({ email, token, type });
      if (!error && data.user) {
        user = data.user;
        break;
      }
    }
    if (!user) {
      return { status: "error", message: "That code is not valid or has expired." };
    }
    const data = { user };
    if (!isAllowedEmail(data.user.email)) {
      await supabase.auth.signOut();
      return { status: "error", message: "That code is not valid." };
    }
  } catch (err) {
    console.error("[verifyLoginCode] failed:", err);
    return { status: "error", message: "We could not verify that code. Please try again." };
  }

  // Outside the try: redirect() signals by throwing, and must not be caught.
  redirect("/admin");
}
