/**
 * Generate a sign-in code for an allowlisted admin, without sending email.
 *
 * admin.generateLink() mints a real OTP server-side and returns it rather than
 * mailing it, so this sidesteps Supabase's built-in 2-emails-per-hour cap
 * entirely. Useful for the initial sign-in, and for reading a code to someone
 * over the phone.
 *
 *   vercel env pull .env.local --environment=production
 *   node --env-file=.env.local scripts/admin-code.mjs you@example.com
 *
 * Requires the service role key, so this is a LOCAL operator tool. It must
 * never be exposed as an unauthenticated route.
 */
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/admin-code.mjs <email>");
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Run: vercel env pull .env.local --environment=production");
  process.exit(1);
}

// Mirror the app's allowlist so this tool cannot mint a code for someone who
// would then be refused at the door anyway.
const allowed = (process.env.ADMIN_ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
const domain = process.env.ADMIN_ALLOWED_DOMAIN?.trim().toLowerCase().replace(/^@/, "");
const permitted =
  allowed.includes(email) || (domain ? email.endsWith(`@${domain}`) : false);

if (!permitted) {
  console.error(`\n  ${email} is not in ADMIN_ALLOWED_EMAILS.`);
  console.error(`  Currently allowed: ${allowed.join(", ") || "(none)"}\n`);
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase.auth.admin.generateLink({
  type: "magiclink",
  email,
});

if (error) {
  console.error("\n  Failed:", error.message, "\n");
  process.exit(1);
}

const otp = data?.properties?.email_otp;
if (!otp) {
  console.error("\n  Supabase returned no email_otp.\n");
  process.exit(1);
}

console.log(`\n  Sign-in code for ${email}\n`);
console.log(`      ${otp}\n`);
console.log("  Enter it at https://fit-recruiting.vercel.app/admin/login");
console.log("  (submit the email first, then type this code)\n");
