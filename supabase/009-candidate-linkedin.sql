-- ===========================================================================
-- Fit Recruiting — a candidate's LinkedIn profile
-- Run after 008-site-content.sql.
--
-- RUN THIS BEFORE DEPLOYING the code that saves it. The résumé form writes a
-- `linkedin` value on every submission; without this column, every submission
-- would fail.
-- ===========================================================================

-- Optional, like phone. Fit's previous site asked for it and their résumé
-- alert email lists it, so the new form does too.
alter table public.candidate_submissions
  add column if not exists linkedin text;
