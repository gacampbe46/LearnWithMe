-- PCAP cohort curriculum + AI Liferaft schema.
-- Copy/paste runnable in Supabase SQL Editor.
--
-- IMPORTANT:
-- - This migration is additive and idempotent where practical.
-- - It does not seed full lesson content.
-- - It assumes the existing LearnWithMe tables already exist:
--   public.programs, public.profile, and auth.users.
-- - Existing PCAP proof-of-concept tables are preserved and lightly bridged
--   with nullable cohort_id columns for gradual migration.

begin;

create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.programs(id) on delete set null,
  slug text not null unique,
  name text not null,
  description text,
  starts_on date,
  ends_on date,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists cohorts_set_updated_at on public.cohorts;
create trigger cohorts_set_updated_at
  before update on public.cohorts
  for each row
  execute function public.set_updated_at();

insert into public.cohorts (slug, name, description, status)
values (
  'pcap-cohort-1',
  'June 2026',
  'PCAP Certification cohort for June 2026 learners.',
  'draft'
)
on conflict (slug) do update
set
  name = excluded.name,
  description = coalesce(public.cohorts.description, excluded.description),
  updated_at = now();

alter table public.cohort_members
  add column if not exists cohort_id uuid references public.cohorts(id) on delete cascade;

alter table public.cohort_quiz_submissions
  add column if not exists cohort_id uuid references public.cohorts(id) on delete cascade;

alter table public.cohort_question_discussions
  add column if not exists cohort_id uuid references public.cohorts(id) on delete cascade;

alter table public.cohort_question_help_requests
  add column if not exists cohort_id uuid references public.cohorts(id) on delete cascade;

update public.cohort_members cm
set cohort_id = c.id
from public.cohorts c
where cm.cohort_id is null
  and cm.cohort_slug = c.slug;

update public.cohort_quiz_submissions s
set cohort_id = c.id
from public.cohorts c
where s.cohort_id is null
  and s.cohort_slug = c.slug;

update public.cohort_question_discussions d
set cohort_id = c.id
from public.cohorts c
where d.cohort_id is null
  and d.cohort_slug = c.slug;

update public.cohort_question_help_requests h
set cohort_id = c.id
from public.cohorts c
where h.cohort_id is null
  and h.cohort_slug = c.slug;

create or replace function public.set_cohort_id_from_slug()
returns trigger
language plpgsql
as $$
begin
  if new.cohort_id is null and new.cohort_slug is not null then
    select c.id
      into new.cohort_id
    from public.cohorts c
    where c.slug = new.cohort_slug
    limit 1;
  end if;

  return new;
end;
$$;

drop trigger if exists cohort_members_set_cohort_id_from_slug on public.cohort_members;
create trigger cohort_members_set_cohort_id_from_slug
  before insert or update of cohort_slug, cohort_id on public.cohort_members
  for each row
  execute function public.set_cohort_id_from_slug();

drop trigger if exists cohort_quiz_submissions_set_cohort_id_from_slug on public.cohort_quiz_submissions;
create trigger cohort_quiz_submissions_set_cohort_id_from_slug
  before insert or update of cohort_slug, cohort_id on public.cohort_quiz_submissions
  for each row
  execute function public.set_cohort_id_from_slug();

drop trigger if exists cohort_question_discussions_set_cohort_id_from_slug on public.cohort_question_discussions;
create trigger cohort_question_discussions_set_cohort_id_from_slug
  before insert or update of cohort_slug, cohort_id on public.cohort_question_discussions
  for each row
  execute function public.set_cohort_id_from_slug();

drop trigger if exists cohort_question_help_requests_set_cohort_id_from_slug on public.cohort_question_help_requests;
create trigger cohort_question_help_requests_set_cohort_id_from_slug
  before insert or update of cohort_slug, cohort_id on public.cohort_question_help_requests
  for each row
  execute function public.set_cohort_id_from_slug();

create unique index if not exists cohort_members_cohort_id_user_id_uidx
  on public.cohort_members (cohort_id, user_id)
  where cohort_id is not null;

create index if not exists cohort_quiz_submissions_cohort_id_idx
  on public.cohort_quiz_submissions (cohort_id, quiz_id);

create index if not exists cohort_question_discussions_cohort_id_idx
  on public.cohort_question_discussions (cohort_id, quiz_id, question_id, created_at);

create index if not exists cohort_question_help_requests_cohort_id_idx
  on public.cohort_question_help_requests (cohort_id, quiz_id, question_id);

create table if not exists public.program_modules (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text,
  objective text,
  phase text not null default 'foundation'
    check (phase in ('foundation', 'pcap_core', 'readiness')),
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program_id, slug),
  unique (program_id, sort_order)
);

drop trigger if exists program_modules_set_updated_at on public.program_modules;
create trigger program_modules_set_updated_at
  before update on public.program_modules
  for each row
  execute function public.set_updated_at();

create table if not exists public.program_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.program_modules(id) on delete cascade,
  slug text not null,
  title text not null,
  objective text,
  summary text,
  content_markdown text,
  lesson_type text not null default 'core'
    check (lesson_type in ('core', 'refresher', 'review', 'assessment_prep')),
  estimated_minutes integer not null default 7
    check (estimated_minutes between 1 and 20),
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, slug),
  unique (module_id, sort_order)
);

drop trigger if exists program_lessons_set_updated_at on public.program_lessons;
create trigger program_lessons_set_updated_at
  before update on public.program_lessons
  for each row
  execute function public.set_updated_at();

create table if not exists public.curriculum_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_topics (
  lesson_id uuid not null references public.program_lessons(id) on delete cascade,
  topic_id uuid not null references public.curriculum_topics(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (lesson_id, topic_id)
);

create unique index if not exists lesson_topics_one_primary_per_lesson_uidx
  on public.lesson_topics (lesson_id)
  where is_primary;

create table if not exists public.lesson_quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.program_lessons(id) on delete cascade,
  module_id uuid references public.program_modules(id) on delete cascade,
  cohort_id uuid references public.cohorts(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  quiz_type text not null default 'lesson_checkpoint'
    check (
      quiz_type in (
        'lesson_checkpoint',
        'module_review',
        'milestone',
        'practice_exam',
        'final_readiness'
      )
    ),
  sort_order integer not null default 0,
  current_question_ratio numeric(4, 2) not null default 0.70
    check (current_question_ratio between 0 and 1),
  refresher_question_ratio numeric(4, 2) not null default 0.30
    check (refresher_question_ratio between 0 and 1),
  time_limit_minutes integer,
  passing_percent integer default 70 check (passing_percent between 0 and 100),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (lesson_id is not null or module_id is not null or cohort_id is not null)
);

drop trigger if exists lesson_quizzes_set_updated_at on public.lesson_quizzes;
create trigger lesson_quizzes_set_updated_at
  before update on public.lesson_quizzes
  for each row
  execute function public.set_updated_at();

create unique index if not exists lesson_quizzes_lesson_slug_uidx
  on public.lesson_quizzes (lesson_id, slug)
  where lesson_id is not null;

create unique index if not exists lesson_quizzes_module_slug_uidx
  on public.lesson_quizzes (module_id, slug)
  where module_id is not null;

create unique index if not exists lesson_quizzes_cohort_slug_uidx
  on public.lesson_quizzes (cohort_id, slug)
  where cohort_id is not null;

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.lesson_quizzes(id) on delete cascade,
  slug text not null,
  question_type text not null
    check (
      question_type in (
        'multiple_choice',
        'multi_select',
        'fill_blank',
        'free_response',
        'code_output',
        'code_completion'
      )
    ),
  question_role text not null default 'current'
    check (question_role in ('current', 'refresher')),
  prompt_markdown text not null,
  code_snippet text,
  expected_output text,
  choices jsonb not null default '[]'::jsonb,
  correct_answer jsonb not null default '{}'::jsonb,
  explanation_markdown text,
  discussion_prompt text,
  primary_topic_id uuid references public.curriculum_topics(id) on delete set null,
  source_module_id uuid references public.program_modules(id) on delete set null,
  source_lesson_id uuid references public.program_lessons(id) on delete set null,
  refresher_lesson_id uuid references public.program_lessons(id) on delete set null,
  sort_order integer not null default 0,
  points numeric(6, 2) not null default 1,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (quiz_id, slug),
  unique (quiz_id, sort_order)
);

drop trigger if exists quiz_questions_set_updated_at on public.quiz_questions;
create trigger quiz_questions_set_updated_at
  before update on public.quiz_questions
  for each row
  execute function public.set_updated_at();

create table if not exists public.quiz_question_secondary_topics (
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  topic_id uuid not null references public.curriculum_topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (question_id, topic_id)
);

create table if not exists public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  quiz_id uuid not null references public.lesson_quizzes(id) on delete cascade,
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_number integer not null default 1 check (attempt_number > 0),
  answer_payload jsonb not null default '{}'::jsonb,
  is_correct boolean,
  score numeric(6, 2),
  feedback_markdown text,
  topic_snapshot jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  unique (question_id, user_id, attempt_number)
);

create index if not exists question_attempts_cohort_user_idx
  on public.question_attempts (cohort_id, user_id, submitted_at desc);

create index if not exists question_attempts_question_idx
  on public.question_attempts (question_id, submitted_at desc);

create table if not exists public.discussion_threads (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  lesson_id uuid references public.program_lessons(id) on delete cascade,
  question_id uuid references public.quiz_questions(id) on delete cascade,
  title text,
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (lesson_id is not null or question_id is not null)
);

drop trigger if exists discussion_threads_set_updated_at on public.discussion_threads;
create trigger discussion_threads_set_updated_at
  before update on public.discussion_threads
  for each row
  execute function public.set_updated_at();

create unique index if not exists discussion_threads_lesson_uidx
  on public.discussion_threads (cohort_id, lesson_id)
  where lesson_id is not null and question_id is null;

create unique index if not exists discussion_threads_question_uidx
  on public.discussion_threads (cohort_id, question_id)
  where question_id is not null;

create table if not exists public.discussion_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.discussion_threads(id) on delete cascade,
  parent_message_id uuid references public.discussion_messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

drop trigger if exists discussion_messages_set_updated_at on public.discussion_messages;
create trigger discussion_messages_set_updated_at
  before update on public.discussion_messages
  for each row
  execute function public.set_updated_at();

create index if not exists discussion_messages_thread_idx
  on public.discussion_messages (thread_id, created_at);

create table if not exists public.ai_liferaft_requests (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.discussion_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  requested_at timestamptz not null default now(),
  unique (thread_id, user_id)
);

create table if not exists public.ai_responses (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.discussion_threads(id) on delete cascade,
  model text not null,
  prompt_context jsonb not null default '{}'::jsonb,
  response_markdown text not null,
  misconception_signals jsonb not null default '[]'::jsonb,
  requested_by_user_ids uuid[] not null default '{}'::uuid[],
  activation_threshold integer not null default 2 check (activation_threshold > 0),
  created_at timestamptz not null default now()
);

create index if not exists ai_responses_thread_created_idx
  on public.ai_responses (thread_id, created_at desc);

create table if not exists public.learner_progress (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid references public.program_modules(id) on delete cascade,
  lesson_id uuid references public.program_lessons(id) on delete cascade,
  quiz_id uuid references public.lesson_quizzes(id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  completed_at timestamptz,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (module_id is not null or lesson_id is not null or quiz_id is not null)
);

drop trigger if exists learner_progress_set_updated_at on public.learner_progress;
create trigger learner_progress_set_updated_at
  before update on public.learner_progress
  for each row
  execute function public.set_updated_at();

create unique index if not exists learner_progress_module_uidx
  on public.learner_progress (cohort_id, user_id, module_id)
  where module_id is not null and lesson_id is null and quiz_id is null;

create unique index if not exists learner_progress_lesson_uidx
  on public.learner_progress (cohort_id, user_id, lesson_id)
  where lesson_id is not null;

create unique index if not exists learner_progress_quiz_uidx
  on public.learner_progress (cohort_id, user_id, quiz_id)
  where quiz_id is not null;

create table if not exists public.learner_topic_progress (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.curriculum_topics(id) on delete cascade,
  attempts_count integer not null default 0 check (attempts_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  last_attempt_at timestamptz,
  mastery_score numeric(5, 2) not null default 0 check (mastery_score between 0 and 100),
  needs_refresher boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cohort_id, user_id, topic_id),
  check (correct_count <= attempts_count)
);

drop trigger if exists learner_topic_progress_set_updated_at on public.learner_topic_progress;
create trigger learner_topic_progress_set_updated_at
  before update on public.learner_topic_progress
  for each row
  execute function public.set_updated_at();

create or replace function public.is_cohort_member(p_cohort_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cohort_members cm
    where cm.cohort_id = p_cohort_id
      and cm.user_id = auth.uid()
  );
$$;

create or replace function public.is_program_cohort_member(p_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cohorts c
    join public.cohort_members cm on cm.cohort_id = c.id
    where c.program_id = p_program_id
      and cm.user_id = auth.uid()
  );
$$;

create or replace function public.user_contributed_to_thread(p_thread_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.discussion_messages dm
    where dm.thread_id = p_thread_id
      and dm.user_id = auth.uid()
      and dm.deleted_at is null
  );
$$;

grant execute on function public.is_cohort_member(uuid) to authenticated;
grant execute on function public.is_program_cohort_member(uuid) to authenticated;
grant execute on function public.user_contributed_to_thread(uuid) to authenticated;

alter table public.cohorts enable row level security;
alter table public.program_modules enable row level security;
alter table public.program_lessons enable row level security;
alter table public.curriculum_topics enable row level security;
alter table public.lesson_topics enable row level security;
alter table public.lesson_quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_question_secondary_topics enable row level security;
alter table public.question_attempts enable row level security;
alter table public.discussion_threads enable row level security;
alter table public.discussion_messages enable row level security;
alter table public.ai_liferaft_requests enable row level security;
alter table public.ai_responses enable row level security;
alter table public.learner_progress enable row level security;
alter table public.learner_topic_progress enable row level security;

drop policy if exists "cohorts_select_authenticated" on public.cohorts;
create policy "cohorts_select_authenticated"
  on public.cohorts
  for select
  to authenticated
  using (
    status = 'published'
    or public.is_cohort_member(id)
  );

drop policy if exists "cohort_members_select_same_cohort" on public.cohort_members;
create policy "cohort_members_select_same_cohort"
  on public.cohort_members
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or (cohort_id is not null and public.is_cohort_member(cohort_id))
  );

drop policy if exists "cohort_members_insert_self_by_cohort_id" on public.cohort_members;
create policy "cohort_members_insert_self_by_cohort_id"
  on public.cohort_members
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and cohort_id is not null
  );

drop policy if exists "program_modules_select_cohort_members" on public.program_modules;
create policy "program_modules_select_cohort_members"
  on public.program_modules
  for select
  to authenticated
  using (
    is_published
    and public.is_program_cohort_member(program_id)
  );

drop policy if exists "program_lessons_select_cohort_members" on public.program_lessons;
create policy "program_lessons_select_cohort_members"
  on public.program_lessons
  for select
  to authenticated
  using (
    is_published
    and exists (
      select 1
      from public.program_modules pm
      where pm.id = program_lessons.module_id
        and pm.is_published
        and public.is_program_cohort_member(pm.program_id)
    )
  );

drop policy if exists "curriculum_topics_select_authenticated" on public.curriculum_topics;
create policy "curriculum_topics_select_authenticated"
  on public.curriculum_topics
  for select
  to authenticated
  using (true);

drop policy if exists "lesson_topics_select_authenticated" on public.lesson_topics;
create policy "lesson_topics_select_authenticated"
  on public.lesson_topics
  for select
  to authenticated
  using (true);

drop policy if exists "lesson_quizzes_select_cohort_members" on public.lesson_quizzes;
create policy "lesson_quizzes_select_cohort_members"
  on public.lesson_quizzes
  for select
  to authenticated
  using (
    is_published
    and (
      (cohort_id is not null and public.is_cohort_member(cohort_id))
      or exists (
        select 1
        from public.program_modules pm
        where pm.id = lesson_quizzes.module_id
          and public.is_program_cohort_member(pm.program_id)
      )
      or exists (
        select 1
        from public.program_lessons pl
        join public.program_modules pm on pm.id = pl.module_id
        where pl.id = lesson_quizzes.lesson_id
          and public.is_program_cohort_member(pm.program_id)
      )
    )
  );

drop policy if exists "quiz_questions_select_cohort_members" on public.quiz_questions;
create policy "quiz_questions_select_cohort_members"
  on public.quiz_questions
  for select
  to authenticated
  using (
    is_published
    and exists (
      select 1
      from public.lesson_quizzes lq
      where lq.id = quiz_questions.quiz_id
        and lq.is_published
        and (
          (lq.cohort_id is not null and public.is_cohort_member(lq.cohort_id))
          or exists (
            select 1
            from public.program_modules pm
            where pm.id = lq.module_id
              and public.is_program_cohort_member(pm.program_id)
          )
          or exists (
            select 1
            from public.program_lessons pl
            join public.program_modules pm on pm.id = pl.module_id
            where pl.id = lq.lesson_id
              and public.is_program_cohort_member(pm.program_id)
          )
        )
    )
  );

drop policy if exists "quiz_question_secondary_topics_select_authenticated" on public.quiz_question_secondary_topics;
create policy "quiz_question_secondary_topics_select_authenticated"
  on public.quiz_question_secondary_topics
  for select
  to authenticated
  using (true);

drop policy if exists "question_attempts_select_cohort_members" on public.question_attempts;
create policy "question_attempts_select_cohort_members"
  on public.question_attempts
  for select
  to authenticated
  using (public.is_cohort_member(cohort_id));

drop policy if exists "question_attempts_insert_self" on public.question_attempts;
create policy "question_attempts_insert_self"
  on public.question_attempts
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_cohort_member(cohort_id)
  );

drop policy if exists "question_attempts_update_self" on public.question_attempts;
create policy "question_attempts_update_self"
  on public.question_attempts
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and public.is_cohort_member(cohort_id)
  )
  with check (
    user_id = auth.uid()
    and public.is_cohort_member(cohort_id)
  );

drop policy if exists "discussion_threads_select_cohort_members" on public.discussion_threads;
create policy "discussion_threads_select_cohort_members"
  on public.discussion_threads
  for select
  to authenticated
  using (public.is_cohort_member(cohort_id));

drop policy if exists "discussion_threads_insert_member" on public.discussion_threads;
create policy "discussion_threads_insert_member"
  on public.discussion_threads
  for insert
  to authenticated
  with check (
    public.is_cohort_member(cohort_id)
    and (created_by_user_id is null or created_by_user_id = auth.uid())
  );

drop policy if exists "discussion_messages_select_cohort_members" on public.discussion_messages;
create policy "discussion_messages_select_cohort_members"
  on public.discussion_messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.discussion_threads dt
      where dt.id = discussion_messages.thread_id
        and public.is_cohort_member(dt.cohort_id)
    )
  );

drop policy if exists "discussion_messages_insert_self_member" on public.discussion_messages;
create policy "discussion_messages_insert_self_member"
  on public.discussion_messages
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.discussion_threads dt
      where dt.id = discussion_messages.thread_id
        and public.is_cohort_member(dt.cohort_id)
    )
  );

drop policy if exists "discussion_messages_update_self" on public.discussion_messages;
create policy "discussion_messages_update_self"
  on public.discussion_messages
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "ai_liferaft_requests_select_cohort_members" on public.ai_liferaft_requests;
create policy "ai_liferaft_requests_select_cohort_members"
  on public.ai_liferaft_requests
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.discussion_threads dt
      where dt.id = ai_liferaft_requests.thread_id
        and public.is_cohort_member(dt.cohort_id)
    )
  );

drop policy if exists "ai_liferaft_requests_insert_self_after_contribution" on public.ai_liferaft_requests;
create policy "ai_liferaft_requests_insert_self_after_contribution"
  on public.ai_liferaft_requests
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.user_contributed_to_thread(thread_id)
    and exists (
      select 1
      from public.discussion_threads dt
      where dt.id = ai_liferaft_requests.thread_id
        and public.is_cohort_member(dt.cohort_id)
    )
  );

drop policy if exists "ai_responses_select_cohort_members" on public.ai_responses;
create policy "ai_responses_select_cohort_members"
  on public.ai_responses
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.discussion_threads dt
      where dt.id = ai_responses.thread_id
        and public.is_cohort_member(dt.cohort_id)
    )
  );

drop policy if exists "learner_progress_select_cohort_members" on public.learner_progress;
create policy "learner_progress_select_cohort_members"
  on public.learner_progress
  for select
  to authenticated
  using (public.is_cohort_member(cohort_id));

drop policy if exists "learner_progress_insert_self" on public.learner_progress;
create policy "learner_progress_insert_self"
  on public.learner_progress
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_cohort_member(cohort_id)
  );

drop policy if exists "learner_progress_update_self" on public.learner_progress;
create policy "learner_progress_update_self"
  on public.learner_progress
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and public.is_cohort_member(cohort_id)
  )
  with check (
    user_id = auth.uid()
    and public.is_cohort_member(cohort_id)
  );

drop policy if exists "learner_topic_progress_select_cohort_members" on public.learner_topic_progress;
create policy "learner_topic_progress_select_cohort_members"
  on public.learner_topic_progress
  for select
  to authenticated
  using (public.is_cohort_member(cohort_id));

drop policy if exists "learner_topic_progress_insert_self" on public.learner_topic_progress;
create policy "learner_topic_progress_insert_self"
  on public.learner_topic_progress
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_cohort_member(cohort_id)
  );

drop policy if exists "learner_topic_progress_update_self" on public.learner_topic_progress;
create policy "learner_topic_progress_update_self"
  on public.learner_topic_progress
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and public.is_cohort_member(cohort_id)
  )
  with check (
    user_id = auth.uid()
    and public.is_cohort_member(cohort_id)
  );

commit;
