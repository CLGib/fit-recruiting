-- ===========================================================================
-- Fit Recruiting — rate limiting for the public résumé review
-- Run after 005-role-matches.sql.
-- ===========================================================================

-- --------------------------------------------------------------------------
-- One row per review that was actually started.
--
-- /resume-audit is public, unauthenticated, and spends real money on every
-- submission, so it needs a ceiling. Without one, a single person with a loop
-- can run up Fit's Anthropic bill from a page that has no sign-in.
--
-- The IP is stored HASHED, never in the clear. We need to count how often an
-- address has used the tool; we do not need to know the address, and a table
-- of visitor IPs tied to résumé uploads is a privacy liability we have no
-- reason to carry.
-- --------------------------------------------------------------------------
create table if not exists public.audit_usage (
  id         uuid primary key default gen_random_uuid(),
  ip_hash    text not null,
  created_at timestamptz not null default now()
);

-- Both lookups the limiter makes: this address recently, and everyone recently.
create index if not exists audit_usage_ip_idx
  on public.audit_usage (ip_hash, created_at desc);
create index if not exists audit_usage_recent_idx
  on public.audit_usage (created_at desc);

-- Same posture as everything else here: unreachable through the anon key.
alter table public.audit_usage enable row level security;
