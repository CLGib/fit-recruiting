-- ===========================================================================
-- Fit Recruiting — résumé analysis
-- Run after 002-notes-and-status.sql.
-- ===========================================================================

-- One analysis per submission. Cached deliberately: each run costs money, and
-- a résumé does not change, so re-running is opt-in rather than automatic.
create table if not exists public.resume_analyses (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null unique
                   references public.candidate_submissions(id) on delete cascade,
  -- The structured extraction, exactly as returned by the model.
  result         jsonb not null,
  model          text not null,
  -- Kept so cost can be reviewed later without guessing.
  input_tokens   integer,
  output_tokens  integer,
  created_at     timestamptz not null default now(),
  created_by     text not null
);

create index if not exists resume_analyses_submission_idx
  on public.resume_analyses (submission_id);

-- Same posture as everything else here: unreachable through the anon key.
alter table public.resume_analyses enable row level security;
