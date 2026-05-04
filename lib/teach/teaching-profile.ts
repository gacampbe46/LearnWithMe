import type { SupabaseClient } from "@supabase/supabase-js";

export type TeachingProfile = {
  id: string;
  username: string;
  isInstructor: boolean;
};

export async function getTeachingProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<TeachingProfile | null> {
  const { data, error } = await supabase
    .from("profile")
    .select("id, username, is_instructor")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  const username = typeof data.username === "string" ? data.username.trim() : "";
  if (!username) return null;

  return {
    id: data.id,
    username,
    isInstructor: Boolean(data.is_instructor),
  };
}
