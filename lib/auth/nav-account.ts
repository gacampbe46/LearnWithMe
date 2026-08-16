import { NEW_PROGRAM_PATH } from "@/lib/app-paths";
import {
  oauthAccountMenuLabel,
  ssoAvatarUrlFromUser,
} from "@/lib/auth/oauth-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type NavAccount = {
  /** Shown in the account trigger: profile `username` when set, else auth display fallback. */
  displayName: string;
  profilePath: string | null;
  /** Create / manage programs (requires onboarding with a username). */
  newProgramHref: string | null;
  showPayouts: boolean;
  /** Picture from profile storage, else SSO `user_metadata` when available. */
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
    .select("username, avatar_url, is_instructor")
    .eq("user_id", user.id)
    .maybeSingle();

  const username =
    profile && typeof profile.username === "string" && profile.username.trim()
      ? profile.username.trim()
      : null;
  const profilePath = username ? `/${username}` : null;
  const newProgramHref = username ? NEW_PROGRAM_PATH : null;
  const showPayouts = profile?.is_instructor === true;
  const displayName = username ?? oauthAccountMenuLabel(user);
  const storedAvatar =
    profile && typeof profile.avatar_url === "string" && profile.avatar_url.trim()
      ? profile.avatar_url.trim()
      : null;
  const avatarUrl = storedAvatar ?? ssoAvatarUrlFromUser(user);

  return { displayName, profilePath, newProgramHref, showPayouts, avatarUrl };
}
