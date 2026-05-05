/**
 * Parses Supabase Auth `user` / OAuth `user_metadata` in one place
 * (nav account, onboarding defaults, SSO profile picture).
 */

type UserMetaSource = {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

function pickMetaString(
  meta: Record<string, unknown>,
  key: string,
): string | null {
  const v = meta[key];
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function emailLocalPart(email: string | null | undefined): string | null {
  if (typeof email !== "string" || !email.includes("@")) return null;
  const local = email.split("@")[0]?.trim();
  return local && local.length > 0 ? local : null;
}

/** Profile image URL from the IdP (`user_metadata`), e.g. Google `picture` / `avatar_url`. */
export function ssoAvatarUrlFromUser(user: {
  user_metadata?: Record<string, unknown>;
}): string | null {
  const meta = user.user_metadata ?? {};
  return (
    pickMetaString(meta, "avatar_url") ??
    pickMetaString(meta, "picture") ??
    pickMetaString(meta, "avatarUrl")
  );
}

/** Nav trigger label when `profile.username` is not set yet. */
export function oauthAccountMenuLabel(user: UserMetaSource): string {
  const meta = user.user_metadata ?? {};
  return (
    pickMetaString(meta, "full_name") ??
    pickMetaString(meta, "name") ??
    pickMetaString(meta, "given_name") ??
    emailLocalPart(user.email) ??
    "Account"
  );
}

/** Default first / last for the onboarding form from SSO name claims. */
function oauthDefaultFirstLast(user: UserMetaSource): {
  first: string;
  last: string;
} {
  const meta = user.user_metadata ?? {};
  const str = (key: string) => pickMetaString(meta, key) ?? "";
  const full = str("full_name") || str("name");
  if (full) {
    const parts = full.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
    }
    return { first: full, last: "" };
  }
  return { first: str("given_name"), last: str("family_name") };
}

export type OauthAvatarPreview = {
  pictureUrl: string | null;
  /** Initial for `ProfileAvatar` when `pictureUrl` is null. */
  label: string;
};

function oauthAvatarLabel(user: UserMetaSource, first: string, last: string): string {
  const fromName = `${first} ${last}`.trim();
  return fromName || emailLocalPart(user.email) || "Account";
}

/** Everything the onboarding UI needs from the signed-in OAuth user. */
export function oauthOnboardingSeed(user: UserMetaSource): {
  defaultFirstName: string;
  defaultLastName: string;
  avatar: OauthAvatarPreview;
} {
  const { first, last } = oauthDefaultFirstLast(user);
  return {
    defaultFirstName: first,
    defaultLastName: last,
    avatar: {
      pictureUrl: ssoAvatarUrlFromUser(user),
      label: oauthAvatarLabel(user, first, last),
    },
  };
}
