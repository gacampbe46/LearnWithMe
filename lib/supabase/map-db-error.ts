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
  return "Database rules blocked this save. In Supabase → SQL, run supabase/migrations/20260202120000_onboarding_profile_programs_rls.sql (adds profile insert/update/select-own and programs insert for your profile).";
}
