-- Expand the profiles table with academic context columns.
-- These are used by the Quad AI assistant to personalize responses.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS major       text,
  ADD COLUMN IF NOT EXISTS gpa         numeric(3, 2),
  ADD COLUMN IF NOT EXISTS grad_year   integer,
  ADD COLUMN IF NOT EXISTS resume_text text;
