-- PCAP Cohort 1 proof-of-concept tables.
-- Run in Supabase SQL Editor. Safe to run more than once.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.cohort_members (
  id uuid primary key default gen_random_uuid(),
  cohort_slug text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (cohort_slug, user_id)
);

create table if not exists public.cohort_quiz_submissions (
  id uuid primary key default gen_random_uuid(),
  cohort_slug text not null,
  quiz_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score integer not null default 0,
  total_questions integer not null default 0,
  submitted_at timestamptz not null default now(),
  unique (cohort_slug, quiz_id, user_id)
);

create table if not exists public.cohort_question_discussions (
  id uuid primary key default gen_random_uuid(),
  cohort_slug text not null,
  quiz_id text not null,
  question_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cohort_question_help_requests (
  id uuid primary key default gen_random_uuid(),
  cohort_slug text not null,
  quiz_id text not null,
  question_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (cohort_slug, quiz_id, question_id, user_id)
);

create index if not exists cohort_members_cohort_slug_idx
  on public.cohort_members (cohort_slug);

create index if not exists cohort_members_user_id_idx
  on public.cohort_members (user_id);

create index if not exists cohort_quiz_submissions_cohort_quiz_idx
  on public.cohort_quiz_submissions (cohort_slug, quiz_id);

create index if not exists cohort_question_discussions_question_idx
  on public.cohort_question_discussions (cohort_slug, quiz_id, question_id, created_at);

create index if not exists cohort_question_help_requests_question_idx
  on public.cohort_question_help_requests (cohort_slug, quiz_id, question_id);

alter table public.cohort_members enable row level security;
alter table public.cohort_quiz_submissions enable row level security;
alter table public.cohort_question_discussions enable row level security;
alter table public.cohort_question_help_requests enable row level security;

drop policy if exists "pcap_members_select_authenticated" on public.cohort_members;
drop policy if exists "pcap_members_insert_self" on public.cohort_members;
drop policy if exists "pcap_members_delete_self" on public.cohort_members;

drop policy if exists "pcap_submissions_select_members" on public.cohort_quiz_submissions;
drop policy if exists "pcap_submissions_insert_self_member" on public.cohort_quiz_submissions;
drop policy if exists "pcap_submissions_update_self_member" on public.cohort_quiz_submissions;

drop policy if exists "pcap_discussions_select_members" on public.cohort_question_discussions;
drop policy if exists "pcap_discussions_insert_self_member" on public.cohort_question_discussions;
drop policy if exists "pcap_discussions_update_self_member" on public.cohort_question_discussions;
drop policy if exists "pcap_discussions_delete_self_member" on public.cohort_question_discussions;

drop policy if exists "pcap_help_select_members" on public.cohort_question_help_requests;
drop policy if exists "pcap_help_insert_self_member" on public.cohort_question_help_requests;
drop policy if exists "pcap_help_update_self_member" on public.cohort_question_help_requests;

create policy "pcap_members_select_authenticated"
  on public.cohort_members
  for select
  to authenticated
  using (cohort_slug = 'pcap-cohort-1');

create policy "pcap_members_insert_self"
  on public.cohort_members
  for insert
  to authenticated
  with check (
    cohort_slug = 'pcap-cohort-1'
    and user_id = auth.uid()
  );

create policy "pcap_members_delete_self"
  on public.cohort_members
  for delete
  to authenticated
  using (
    cohort_slug = 'pcap-cohort-1'
    and user_id = auth.uid()
  );

create policy "pcap_submissions_select_members"
  on public.cohort_quiz_submissions
  for select
  to authenticated
  using (
    cohort_slug = 'pcap-cohort-1'
    and exists (
      select 1
      from public.cohort_members cm
      where cm.cohort_slug = cohort_quiz_submissions.cohort_slug
        and cm.user_id = auth.uid()
    )
  );

create policy "pcap_submissions_insert_self_member"
  on public.cohort_quiz_submissions
  for insert
  to authenticated
  with check (
    cohort_slug = 'pcap-cohort-1'
    and user_id = auth.uid()
    and exists (
      select 1
      from public.cohort_members cm
      where cm.cohort_slug = cohort_quiz_submissions.cohort_slug
        and cm.user_id = auth.uid()
    )
  );

create policy "pcap_submissions_update_self_member"
  on public.cohort_quiz_submissions
  for update
  to authenticated
  using (
    cohort_slug = 'pcap-cohort-1'
    and user_id = auth.uid()
  )
  with check (
    cohort_slug = 'pcap-cohort-1'
    and user_id = auth.uid()
  );

create policy "pcap_discussions_select_members"
  on public.cohort_question_discussions
  for select
  to authenticated
  using (
    cohort_slug = 'pcap-cohort-1'
    and exists (
      select 1
      from public.cohort_members cm
      where cm.cohort_slug = cohort_question_discussions.cohort_slug
        and cm.user_id = auth.uid()
    )
  );

create policy "pcap_discussions_insert_self_member"
  on public.cohort_question_discussions
  for insert
  to authenticated
  with check (
    cohort_slug = 'pcap-cohort-1'
    and user_id = auth.uid()
    and length(trim(body)) between 1 and 1000
    and exists (
      select 1
      from public.cohort_members cm
      where cm.cohort_slug = cohort_question_discussions.cohort_slug
        and cm.user_id = auth.uid()
    )
  );

create policy "pcap_discussions_update_self_member"
  on public.cohort_question_discussions
  for update
  to authenticated
  using (
    cohort_slug = 'pcap-cohort-1'
    and user_id = auth.uid()
  )
  with check (
    cohort_slug = 'pcap-cohort-1'
    and user_id = auth.uid()
    and length(trim(body)) between 1 and 1000
  );

create policy "pcap_discussions_delete_self_member"
  on public.cohort_question_discussions
  for delete
  to authenticated
  using (
    cohort_slug = 'pcap-cohort-1'
    and user_id = auth.uid()
  );

create policy "pcap_help_select_members"
  on public.cohort_question_help_requests
  for select
  to authenticated
  using (
    cohort_slug = 'pcap-cohort-1'
    and exists (
      select 1
      from public.cohort_members cm
      where cm.cohort_slug = cohort_question_help_requests.cohort_slug
        and cm.user_id = auth.uid()
    )
  );

create policy "pcap_help_insert_self_member"
  on public.cohort_question_help_requests
  for insert
  to authenticated
  with check (
    cohort_slug = 'pcap-cohort-1'
    and user_id = auth.uid()
    and exists (
      select 1
      from public.cohort_members cm
      where cm.cohort_slug = cohort_question_help_requests.cohort_slug
        and cm.user_id = auth.uid()
    )
  );

create policy "pcap_help_update_self_member"
  on public.cohort_question_help_requests
  for update
  to authenticated
  using (
    cohort_slug = 'pcap-cohort-1'
    and user_id = auth.uid()
  )
  with check (
    cohort_slug = 'pcap-cohort-1'
    and user_id = auth.uid()
  );
