-- ===========================================================================
-- Fit Recruiting — recruiter notes and pipeline status
-- Run after 001-submissions.sql.
-- ===========================================================================

-- --------------------------------------------------------------------------
-- Pipeline status on a submission.
--
-- Owned by us, not Bullhorn. These are the stages a recruiter moves someone
-- through while deciding whether to put them forward; Bullhorn's own
-- JobSubmission stages take over once they are formally submitted to a client.
-- --------------------------------------------------------------------------
alter table public.candidate_submissions
  drop constraint if exists candidate_submissions_status_check;

alter table public.candidate_submissions
  add constraint candidate_submissions_status_check
  check (status in ('new', 'reviewing', 'contacted', 'submitted', 'placed', 'not_a_fit'));

-- --------------------------------------------------------------------------
-- Notes.
--
-- Append-only on purpose: a candidate's history should read as a record of
-- what happened, not a field the last person to touch it overwrote. Editing
-- and deleting are deliberately not supported.
--
-- bullhorn_note_id is nullable and unused today. It exists from the start so
-- that pushing history into Bullhorn later is an update, not a migration.
-- --------------------------------------------------------------------------
create table if not exists public.candidate_notes (
  id                uuid primary key default gen_random_uuid(),
  submission_id     uuid not null references public.candidate_submissions(id) on delete cascade,
  author_email      text not null,
  body              text not null check (length(trim(body)) > 0),
  created_at        timestamptz not null default now(),
  bullhorn_note_id  text
);

create index if not exists candidate_notes_submission_idx
  on public.candidate_notes (submission_id, created_at desc);

-- Same posture as the submissions table: RLS on, no policies, so nothing is
-- reachable through the anon key. The app reads and writes with the service
-- role from server code only.
alter table public.candidate_notes enable row level security;
