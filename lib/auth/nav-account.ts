import {
  oauthAccountMenuLabel,
  ssoAvatarUrlFromUser,
} from "@/lib/auth/oauth-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type NavAccount = {
  /** Shown in the account trigger: profile `username` when set, else auth display fallback. */
  displayName: string;
  profilePath: string | null;
  /** Picture from the signed-in SSO account (`user_metadata`), when the provider supplies one. */
  avatarUrl: string | null;
};

export async function getNavAccount(): Promise<NavAccount | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profile")
    .select("username")
    .eq("user_id", user.id)
    .maybeSingle();

  const username =
    profile && typeof profile.username === "string" && profile.username.trim()
      ? profile.username.trim()
      : null;
  const profilePath = username ? `/${username}` : null;
  const displayName = username ?? oauthAccountMenuLabel(user);
  const avatarUrl = ssoAvatarUrlFromUser(user);

  return { displayName, profilePath, avatarUrl };
}
