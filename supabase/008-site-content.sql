-- ===========================================================================
-- Fit Recruiting — let the team edit their own website
-- Run after 007-presentation-resumes.sql.
-- ===========================================================================
--
-- The client's ask (2026-09-11): full control over job postings and the things
-- they update regularly, without depending on a developer for small changes.
--
-- The design choice is STRUCTURED FIELDS, not a page builder. Fit can change
-- any word, number, or photo that is meant to change, but cannot break the
-- layout, because the layout is not something they edit. That is what keeps
-- "easy to manage" and "modern look" from pulling against each other.

-- --------------------------------------------------------------------------
-- 1. Every piece of copy on the public site.
--
-- ONE ROW PER FIELD, keyed "page.field" (for example "home.heroTitle" or
-- "site.phone"). Per field rather than per page for two reasons: saving one
-- section of the editor can never overwrite another section someone else just
-- saved, and a single bad value falls back to its default on its own instead
-- of taking the rest of that page's copy with it.
--
-- The shape of every field is declared in lib/site/copy/pages/*.ts, and every
-- page falls back to its built-in wording for any field with no row, so an
-- empty table is a working site that reads exactly as it did before editing.
-- --------------------------------------------------------------------------
create table if not exists public.site_content (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  text not null
);

alter table public.site_content enable row level security;

-- --------------------------------------------------------------------------
-- 2. The team.
--
-- Seeded from the draft entries in lib/team.ts. Bios are still unapproved,
-- which is why the team page stays hidden from search until the team marks it
-- ready (the `team_page` block in site_content).
-- --------------------------------------------------------------------------
create table if not exists public.team_members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  title       text,
  bio         text,
  -- Either a path under /public (the photos shipped with the site) or a public
  -- URL in the site-media bucket (photos the team uploads themselves).
  photo_url   text,
  photo_alt   text,
  linkedin    text,
  email       text,
  sort_order  integer not null default 0,
  visible     boolean not null default true,
  updated_at  timestamptz not null default now(),
  updated_by  text not null default 'import'
);

create index if not exists team_members_order_idx on public.team_members (sort_order);

alter table public.team_members enable row level security;

insert into public.team_members (name, title, bio, photo_url, photo_alt, linkedin, sort_order)
select * from (values
  ('Chambliss Brister', 'Owner',
   'I''m in the people business, and it is both rewarding and genuinely fun. Every day I get to build real relationships, whether that means helping a company find the right person for their team or helping someone think through their own next step. I see the work as a partnership. It is the best job in the world and I am grateful to do it.',
   '/photos/team-02.jpg', 'Chambliss Brister at the Fit Recruiting office in Mobile',
   'https://www.linkedin.com/in/cbrister/', 1),
  ('Anna Middleton', 'Business Development Manager',
   'I spend my time getting to know the companies we work with, what they actually need, and where someone would genuinely thrive. Partnering with people to help them find a Fit is the best part of this job.',
   '/photos/team-03.jpg', 'Anna Middleton at her desk in the Fit Recruiting office',
   'https://www.linkedin.com/in/anna-middleton-658472bb/', 2),
  ('Lesley Chapman', 'Recruiter',
   'I connect strong candidates with growing companies around Mobile. Building a team is one of the most consequential things a business does, and getting to help with that is a good way to spend a day. The right people really do change everything.',
   null, null,
   'https://www.linkedin.com/in/lesley-chapman-821242413/', 3),
  ('Laura Griffith', 'Recruiter',
   'I spend my days bridging the gap between good people and growing companies here in the Mobile area.',
   '/photos/team-01.jpg', 'Laura Griffith at the Fit Recruiting office in Mobile',
   'https://www.linkedin.com/in/laura-griffith-4b368b190/', 4)
) as seed(name, title, bio, photo_url, photo_alt, linkedin, sort_order)
-- Only seed an empty table, so re-running this never duplicates the team or
-- overwrites edits Fit has already made.
where not exists (select 1 from public.team_members);

-- --------------------------------------------------------------------------
-- 3. Carry the live job board across.
--
-- Until now the public board read a hardcoded list transcribed from the old
-- WordPress site, so roles created in the portal never appeared publicly.
-- The board now reads the roles table. Copying the current postings in first
-- means nothing disappears on the day this ships, and every existing posting
-- becomes something Fit can edit or close themselves.
-- --------------------------------------------------------------------------
insert into public.roles (slug, title, location, employment_type, categories, status, site_published_at, created_at, created_by)
values
  ('tax-accountant-mobile-al', 'Tax Accountant', 'Mobile, AL', 'Full Time', array['Wholesale Building Materials'], 'open', '2026-06-24', '2026-06-24', 'import'),
  ('senior-purchasing-manager-spanish-fort-al', 'Senior Purchasing Manager', 'Spanish Fort, AL', 'Full Time', array['Manufacturing'], 'open', '2026-06-24', '2026-06-24', 'import'),
  ('inside-sales-representative-spanish-fort-al', 'Inside Sales Representative', 'Spanish Fort, AL', 'Full Time', array['Manufacturing', 'Sales & Marketing'], 'open', '2026-06-24', '2026-06-24', 'import'),
  ('accounts-receivable-supervisor-mobile-al', 'Accounts Receivable Supervisor', 'Mobile, AL', 'Full Time', array['Accounting / Finance', 'Construction / Facilities', 'Manufacturing'], 'open', '2026-06-24', '2026-06-24', 'import'),
  ('legal-assistant-mobile-al', 'Legal Assistant', 'Mobile, AL', 'Full Time', array['Legal Services'], 'open', '2026-06-24', '2026-06-24', 'import'),
  ('business-operations-analyst-mobile-al', 'Business Operations Analyst', 'Mobile, AL', 'Full Time', array['Insurance'], 'open', '2026-06-24', '2026-06-24', 'import'),
  ('accounts-payable-supervisor-mobile-al', 'Accounts Payable Supervisor', 'Mobile, AL', 'Full Time', array['Accounting / Finance'], 'draft', null, '2026-05-29', 'import'),
  ('operations-manager-mobile-al', 'Operations Manager', 'Mobile, AL', 'Full Time', array['Construction / Facilities', 'Wholesale Building Materials'], 'closed', null, '2026-05-28', 'import'),
  ('executive-director-mobile-al', 'Executive Director', 'Mobile, AL', 'Full Time', array['Executive', 'Non-Profit'], 'closed', null, '2026-03-25', 'import')
-- A role Fit has already created or edited is never overwritten.
on conflict (slug) do nothing;

-- --------------------------------------------------------------------------
-- 4. Photos the team uploads.
--
-- PUBLIC, unlike the résumés bucket: these are website images, meant to be
-- seen by every visitor. Writes still only happen from server code with the
-- service role, so nobody can upload through the anon key.
-- --------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;
