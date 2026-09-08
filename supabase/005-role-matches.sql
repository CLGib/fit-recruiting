-- ===========================================================================
-- Fit Recruiting — candidate read against the open roles
-- Run after 004-roles.sql.
-- ===========================================================================

-- One match run per submission, replaced when it is run again.
--
-- Cached for the same reason the briefing is: it costs money, and the résumé
-- does not change. It DOES go stale when the open roles change, which is why
-- roles_hash is stored — the screen can tell a recruiter the run predates the
-- roles they are looking at.
create table if not exists public.resume_role_matches (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null unique
                   references public.candidate_submissions(id) on delete cascade,
  result         jsonb not null,
  -- Sorted slugs of the roles this run considered, joined with commas.
  roles_hash     text not null,
  model          text not null,
  input_tokens   integer,
  output_tokens  integer,
  created_at     timestamptz not null default now(),
  created_by     text not null
);

create index if not exists resume_role_matches_submission_idx
  on public.resume_role_matches (submission_id);

alter table public.resume_role_matches enable row level security;
