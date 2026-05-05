import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTeachingProfile } from "@/lib/teach/teaching-profile";

/** True when the signed-in user owns the program via `programs.profile_id`. */
export async function currentUserCanManageProgram(
  programId: string,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const profile = await getTeachingProfile(supabase, user.id);
  if (!profile) return false;

  const { data: program } = await supabase
    .from("programs")
    .select("profile_id")
    .eq("id", programId)
    .maybeSingle();

  return Boolean(program && program.profile_id === profile.id);
}
