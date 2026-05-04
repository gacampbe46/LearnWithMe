/** Postgres / PostgREST permission and RLS failures */
export function isRlsOrPermissionError(err: {
  message?: string;
  code?: string;
}): boolean {
  const msg = err.message ?? "";
  if (msg.includes("row-level security")) return true;
  if (err.code === "42501") return true;
  return false;
}

export function friendlyDbPermissionMessage(): string {
  return "Database rules blocked this save. In Supabase Dashboard → SQL Editor: run `supabase/migrations/20260202120000_onboarding_profile_programs_rls.sql` from this repo if you haven’t yet (profile, programs, and sessions). If only adding sessions fails, run `supabase/migrations/20260504180000_sessions_rls_only.sql`. Grants must allow authenticated users to INSERT/UPDATE/DELETE `sessions` for programs tied to their `profile` row. Topic chips use `public.tags`.";
}
