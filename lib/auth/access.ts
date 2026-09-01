/**
 * Who may reach the admin area.
 *
 * Supabase will send a magic link to ANY address that asks, so authentication
 * alone is not authorisation. Without this allowlist, anyone who guessed the
 * URL could request a link and read every candidate submission.
 *
 * Configured with ADMIN_ALLOWED_EMAILS (comma separated) and/or
 * ADMIN_ALLOWED_DOMAIN. If neither is set, nobody is allowed: failing closed
 * is the only safe default for a page holding résumés.
 */

function list(): string[] {
  return (process.env.ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function domain(): string | null {
  const d = process.env.ADMIN_ALLOWED_DOMAIN?.trim().toLowerCase();
  return d ? d.replace(/^@/, "") : null;
}

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  const allowed = list();
  const dom = domain();
  if (allowed.length === 0 && !dom) return false; // fail closed
  if (allowed.includes(e)) return true;
  return dom ? e.endsWith(`@${dom}`) : false;
}

export function isAdminConfigured(): boolean {
  return list().length > 0 || domain() !== null;
}
