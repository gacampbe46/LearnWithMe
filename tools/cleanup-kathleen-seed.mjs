/**
 * Removes the legacy Kathleen sample creator from Supabase
 * (profile + programs + sessions). Kathleen remains as a
 * non-clickable explore-card placeholder only.
 *
 * Usage:
 *   npm run cleanup:kathleen
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import { createClient } from "@supabase/supabase-js";

const USERNAME = "kathleen";

function mustGetEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

async function main() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    mustGetEnv("NEXT_PUBLIC_SUPABASE_URL");
    mustGetEnv("SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("id, username")
    .eq("username", USERNAME)
    .maybeSingle();

  if (profileError) throw profileError;

  if (!profile) {
    console.log(`No profile found for username "${USERNAME}" — nothing to clean up.`);
    return;
  }

  const { data: programs, error: programsError } = await supabase
    .from("programs")
    .select("id, title")
    .eq("profile_id", profile.id);

  if (programsError) throw programsError;

  const programIds = (programs ?? []).map((p) => p.id);

  if (programIds.length > 0) {
    const { error: sessionsError } = await supabase
      .from("sessions")
      .delete()
      .in("program_id", programIds);
    if (sessionsError) throw sessionsError;

    const { error: deleteProgramsError } = await supabase
      .from("programs")
      .delete()
      .in("id", programIds);
    if (deleteProgramsError) throw deleteProgramsError;
  }

  const { error: deleteProfileError } = await supabase
    .from("profile")
    .delete()
    .eq("id", profile.id);

  if (deleteProfileError) throw deleteProfileError;

  console.log("Kathleen sample creator removed from Supabase.");
  console.log({
    profileId: profile.id,
    programsRemoved: (programs ?? []).map((p) => p.title),
  });
  console.log(
    "Sample program is now Get to Sewing on /learnwithme — no re-seed required.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
