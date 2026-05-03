import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * True when this user has no profile row, or no public username yet.
 * Used by middleware/proxy (already have `user.id`) and by `profileNeedsOnboarding`.
 */
export async function profileNeedsOnboardingForUserId(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data: profile } = await supabase
    .from("profile")
    .select("username")
    .eq("user_id", userId)
    .maybeSingle();

  const u = profile?.username;
  const hasUsername = typeof u === "string" && u.trim().length > 0;
  return !hasUsername;
}

/**
 * True when the signed-in user has no profile row, or no public username yet.
 * Used after OAuth to route into onboarding before the rest of the app.
 */
export async function profileNeedsOnboarding(
  supabase: SupabaseClient,
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  return profileNeedsOnboardingForUserId(supabase, user.id);
}
