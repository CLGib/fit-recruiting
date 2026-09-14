/**
 * Give an allowlisted person a password for the team portal.
 *
 *   npm run admin:password -- chambliss@fitrecruiting.com
 *   npm run admin:password -- chambliss@fitrecruiting.com "a password you choose"
 *
 * Creates their account if they have never signed in, or replaces their
 * password if they have. Run it again any time to change it. With no password
 * given, a strong random one is generated and printed.
 *
 * Exists because, until custom SMTP is set up, Supabase will not email sign-in
 * codes to anyone outside the Supabase team, so nobody at Fit could get one.
 *
 * Needs the service role key, so this is a LOCAL operator tool. It must never
 * be exposed as a route.
 */
import { randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2]?.trim().toLowerCase();
const chosen = process.argv[3];

if (!email) {
  console.error('Usage: npm run admin:password -- <email> ["optional password"]');
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("\n  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  console.error("  Copy both from the Supabase dashboard: Settings -> API Keys.\n");
  process.exit(1);
}

// Mirror the app's allowlist, so this cannot create a login for someone who
// would be refused at the door anyway.
const allowed = (process.env.ADMIN_ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
const domain = process.env.ADMIN_ALLOWED_DOMAIN?.trim().toLowerCase().replace(/^@/, "");
if (!allowed.includes(email) && !(domain && email.endsWith(`@${domain}`))) {
  console.error(`\n  ${email} would not be allowed to sign in.`);
  console.error(`  Add ADMIN_ALLOWED_DOMAIN=fitrecruiting.com (or the address) to .env.local, to match Vercel.\n`);
  process.exit(1);
}

/** Three groups of five from letters and digits that cannot be misread. */
function generate() {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const group = () => Array.from({ length: 5 }, () => alphabet[randomInt(alphabet.length)]).join("");
  return `${group()}-${group()}-${group()}`;
}

const password = chosen ?? generate();
if (chosen && chosen.length < 12) {
  console.warn("\n  Warning: that password is short. The portal holds candidates' résumés,");
  console.warn("  on a public web address. A generated one is much safer.");
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Find an existing account. Fit's team is small, so one page covers it.
const { data: list, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) {
  console.error("\n  Could not look up accounts:", listError.message, "\n");
  process.exit(1);
}
const existing = list.users.find((u) => u.email?.toLowerCase() === email);

const { error } = existing
  ? await supabase.auth.admin.updateUserById(existing.id, { password, email_confirm: true })
  : await supabase.auth.admin.createUser({ email, password, email_confirm: true });

if (error) {
  console.error(`\n  Failed: ${error.message}`);
  if (/password/i.test(error.message)) {
    console.error("  Supabase may require a longer password. Check Authentication -> Settings.");
  }
  console.error("");
  process.exit(1);
}

console.log(`\n  ${existing ? "Password changed" : "Account created"} for ${email}\n`);
console.log(`      ${password}\n`);
console.log("  Sign in at https://fit-recruiting.vercel.app/admin/login");
console.log("  Send the password separately from the link, e.g. by text.\n");
