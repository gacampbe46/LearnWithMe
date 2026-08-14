-- Add Gumlet processing status and thumbnail on sessions.
-- Copy/paste runnable in Supabase SQL Editor.
-- Additive and idempotent.

begin;

alter table public.sessions
  add column if not exists video_status text;

alter table public.sessions
  add column if not exists thumbnail_url text;

alter table public.sessions
  drop constraint if exists sessions_video_status_check;

alter table public.sessions
  add constraint sessions_video_status_check
  check (
    video_status is null
    or video_status in ('processing', 'ready', 'errored')
  );

commit;
