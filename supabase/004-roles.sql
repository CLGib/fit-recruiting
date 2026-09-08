-- ===========================================================================
-- Fit Recruiting — roles the team writes and publishes
-- Run after 003-resume-analysis.sql.
-- ===========================================================================

-- --------------------------------------------------------------------------
-- A role.
--
-- This is Fit's own copy, not a mirror of Bullhorn. A recruiter drafts here,
-- decides where it goes, and publishes. Once Bullhorn credentials exist,
-- bullhorn_job_order_id links the two records and a role can round-trip.
--
-- The long-form fields are nullable throughout. A half-written draft is a
-- normal state, and the public site already degrades gracefully when a
-- description is missing.
-- --------------------------------------------------------------------------
create table if not exists public.roles (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  location         text not null,
  employment_type  text not null default 'Full Time'
                     check (employment_type in ('Full Time', 'Part Time', 'Contract', 'Temp-to-Hire')),
  categories       text[] not null default '{}',
  salary           text,

  -- What the recruiter jotted down from the client call. Kept because the
  -- description gets redrafted more than once and the brief should not have to
  -- be retyped each time.
  intake_notes     text,

  summary          text,
  responsibilities text[] not null default '{}',
  requirements     text[] not null default '{}',

  -- draft: not on the site. open: live. closed: filled or withdrawn.
  status           text not null default 'draft'
                     check (status in ('draft', 'open', 'closed')),

  -- Where this role has been sent. Null means "never published there".
  -- Deliberately separate columns rather than a jsonb blob: each channel has
  -- its own identifier and its own failure mode, and we will query by them.
  site_published_at    timestamptz,
  bullhorn_job_order_id text,
  bullhorn_synced_at    timestamptz,
  linkedin_urn          text,
  linkedin_synced_at    timestamptz,

  -- Set when the description came from a model, so it is always visible in the
  -- record that a human should have read it before it went out.
  description_model text,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  created_by       text not null
);

create index if not exists roles_status_idx on public.roles (status, created_at desc);

-- Same posture as everything else here: unreachable through the anon key.
alter table public.roles enable row level security;
