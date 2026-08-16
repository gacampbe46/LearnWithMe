-- Stripe Connect Express fields on creators + one-time program entitlements.
-- Copy/paste runnable in Supabase SQL Editor.
-- Additive and idempotent.

begin;

alter table public.profile
  add column if not exists stripe_account_id text;

alter table public.profile
  add column if not exists stripe_charges_enabled boolean not null default false;

alter table public.profile
  add column if not exists stripe_details_submitted boolean not null default false;

create unique index if not exists profile_stripe_account_id_uidx
  on public.profile (stripe_account_id)
  where stripe_account_id is not null;

create table if not exists public.program_entitlements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  program_id uuid not null references public.programs (id) on delete cascade,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  amount_cents integer not null check (amount_cents >= 0),
  application_fee_cents integer not null check (application_fee_cents >= 0),
  currency text not null default 'usd',
  status text not null default 'active'
    check (status in ('active', 'refunded')),
  unique (user_id, program_id)
);

create unique index if not exists program_entitlements_checkout_session_uidx
  on public.program_entitlements (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists program_entitlements_program_id_idx
  on public.program_entitlements (program_id);

create index if not exists program_entitlements_user_id_idx
  on public.program_entitlements (user_id);

alter table public.program_entitlements enable row level security;

drop policy if exists "program_entitlements_select_own" on public.program_entitlements;
create policy "program_entitlements_select_own"
  on public.program_entitlements
  for select
  to authenticated
  using (user_id = auth.uid());

commit;
