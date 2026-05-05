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
  return (
    "Supabase RLS blocked this. In Dashboard → SQL Editor, paste and run " +
    "`tools/sql/run-all-owner-policies.sql` from this repo, then retry."
  );
}

/** Learner visibility uses RPC `set_program_is_active` + policies — see tools/sql. */
export function friendlyLearnerVisibilityRlsMessage(): string {
  return (
    "Could not save learner visibility. In Supabase SQL Editor, run the latest `tools/sql/run-all-owner-policies.sql` (creates `set_program_is_active`). " +
    "Use the same Supabase project as `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`."
  );
}
