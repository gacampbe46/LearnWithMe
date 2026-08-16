-- Persist Gumlet folder ids for creator and program organization.
-- Copy/paste runnable in Supabase SQL Editor.
-- Additive and idempotent.

begin;

alter table public.profile
  add column if not exists gumlet_folder_id text;

alter table public.programs
  add column if not exists gumlet_folder_id text;

commit;
