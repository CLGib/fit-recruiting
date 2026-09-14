import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * A shared test PIN for the team portal, chosen by Christina while Fit is
 * reviewing the site (2026-09-14).
 *
 * Exists because, until custom SMTP is set up, Supabase will not email sign-in
 * codes to anyone outside the Supabase team, so nobody at Fit could get one.
 *
 * Deliberately simple, and deliberately temporary:
 * - On only while ADMIN_TEST_PIN is set. Delete it and PIN sign-in, including
 *   every existing PIN session, stops working immediately.
 * - The session cookie is signed with a key that includes the PIN, so changing
 *   the PIN signs everyone out.
 * - The email allowlist still applies, so notes still carry a real name.
 */

const COOKIE = "fit_pin_session";
const MAX_AGE_SECONDS = 14 * 24 * 60 * 60;

export function isPinEnabled(): boolean {
  return Boolean(process.env.ADMIN_TEST_PIN?.trim());
}

/**
 * The PIN alone may be short, so the service role key is mixed in. It is
 * server-only and high entropy, which keeps the signature unguessable even
 * when the PIN is "1234".
 */
function sign(payload: string): string {
  const key = `${process.env.ADMIN_TEST_PIN ?? ""}:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`;
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function pinMatches(pin: string): boolean {
  const expected = process.env.ADMIN_TEST_PIN?.trim();
  return Boolean(expected) && safeEqual(pin.trim(), expected!);
}

/** Only for use in a server action: cookies can only be set there. */
export async function createPinSession(email: string): Promise<void> {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${Buffer.from(email).toString("base64url")}.${expires}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // The portal only. The public site never sees it.
    path: "/admin",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** The signed-in address from a valid PIN session, or null. */
export async function getPinSessionEmail(): Promise<string | null> {
  if (!isPinEnabled()) return null;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;

  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [encodedEmail, expires, signature] = parts;
  const payload = `${encodedEmail}.${expires}`;
  if (!safeEqual(signature, sign(payload))) return null;
  if (!(Number(expires) > Date.now())) return null;

  const email = Buffer.from(encodedEmail, "base64url").toString("utf8");
  return email || null;
}

/** Only for use in a server action. */
export async function clearPinSession(): Promise<void> {
  (await cookies()).set(COOKIE, "", { path: "/admin", maxAge: 0 });
}
