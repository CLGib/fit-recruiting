-- ===========================================================================
-- Fit Recruiting — the client-ready copy of a candidate's résumé
-- Run after 006-audit-usage.sql.
-- ===========================================================================

-- --------------------------------------------------------------------------
-- A candidate's résumé, restructured onto Fit's own template so it can go to
-- the hiring manager looking like everything else Fit sends.
--
-- Reformatting a candidate's résumé before presenting it is ordinary agency
-- practice. Rewriting what it CLAIMS is not, so `content` is an extraction of
-- what the document already says, and the PDF states on its face that Fit
-- prepared it from the candidate's own résumé. Nothing here is a substitute for
-- a recruiter reading it before it goes out.
--
-- Cached because it costs money to produce and the source document does not
-- change. Re-running replaces it.
-- --------------------------------------------------------------------------
create table if not exists public.presentation_resumes (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null unique
                   references public.candidate_submissions(id) on delete cascade,
  content        jsonb not null,
  model          text not null,
  input_tokens   integer,
  output_tokens  integer,
  created_at     timestamptz not null default now(),
  created_by     text not null
);

create index if not exists presentation_resumes_submission_idx
  on public.presentation_resumes (submission_id);

alter table public.presentation_resumes enable row level security;
