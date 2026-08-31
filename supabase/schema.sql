-- ===========================================================================
-- Fit Recruiting — candidate submissions
-- Run once in the Supabase SQL editor.
-- ===========================================================================

create table if not exists public.candidate_submissions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  first_name      text not null,
  last_name       text not null,
  email           text not null,
  phone           text,
  -- Slug of the role applied for. Null for a general submission.
  role_slug       text,
  message         text,
  -- Path inside the private resumes bucket. Null only if the upload failed.
  resume_path     text,
  resume_filename text,
  status          text not null default 'new'
);

create index if not exists candidate_submissions_created_at_idx
  on public.candidate_submissions (created_at desc);
create index if not exists candidate_submissions_email_idx
  on public.candidate_submissions (email);

-- RLS on with NO policies: nothing reaches this table through the anon or
-- authenticated keys. The site writes with the service role, which bypasses
-- RLS by design. Recruiters read through the Supabase dashboard until the
-- Phase 2 admin view exists.
alter table public.candidate_submissions enable row level security;

-- ---------------------------------------------------------------------------
-- Storage bucket. Create in the dashboard (Storage -> New bucket) named
-- "resumes" with Public UNCHECKED, or run:
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- No storage policies are added on purpose. With none, only the service role
-- can read or write the bucket. Résumés must never be publicly reachable, and
-- a bucket left public is the single most common way candidate data leaks.
