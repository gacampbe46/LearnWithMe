"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import type { ProfileViewPreference } from "@/lib/member/types";
import { parseAvatarUrlField } from "@/lib/profile/avatar-form";
import { parseBannerUrlField } from "@/lib/profile/banner-form";
import { resolveProfileTagIds } from "@/lib/catalog/resolve-profile-tag-ids";
import { parseInterestTagIds } from "@/lib/onboarding/form-tags";
import { parseAndValidateUsername } from "@/lib/onboarding/username";
import { renameGumletFolderBestEffort } from "@/lib/gumlet/folders";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  friendlyDbPermissionMessage,
  isRlsOrPermissionError,
} from "@/lib/supabase/map-db-error";

function formText(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  return typeof v === "string" ? v : null;
}

function trimField(v: string | null, max: number): string {
  return (v ?? "").trim().slice(0, max);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseProfileLayout(raw: string | null): "link_hub" | "full_content" | null {
  if (raw === "link_hub" || raw === "full_content") {
    return raw;
  }
  return null;
}

const QUOTE_MAX = 180;
const TAGLINE_MAX = 200;
const FEATURED_SESSION_MAX = 3;

function parseFeaturedSessionIds(formData: FormData): string[] {
  const values = formData.getAll("featured_session");
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    if (typeof v !== "string") continue;
    const id = v.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
    if (ids.length >= FEATURED_SESSION_MAX) break;
  }
  return ids;
}

const emptyErrors: ProfileUpdateState = {
  formError: null,
  usernameError: null,
  interestsError: null,
  avatarError: null,
  bannerError: null,
};

export type ProfileUpdateState = {
  formError: string | null;
  usernameError: string | null;
  interestsError: string | null;
  avatarError: string | null;
  bannerError: string | null;
};

export async function updateProfileByUsername(
  _prev: ProfileUpdateState,
  formData: FormData,
): Promise<ProfileUpdateState> {
  const currentUsername = trimField(
    formText(formData, "current_username"),
    80,
  ).toLowerCase();
  if (!currentUsername) {
    return { ...emptyErrors, formError: "Missing profile username." };
  }

  const usernameCheck = parseAndValidateUsername(formText(formData, "username"));
  if (!usernameCheck.ok) {
    return { ...emptyErrors, usernameError: usernameCheck.message };
  }
  const nextUsername = usernameCheck.normalized;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ...emptyErrors,
      formError: "You are not signed in. Sign in and try again.",
    };
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profile")
    .select("id, user_id, links, tags, gumlet_folder_id")
    .eq("username", currentUsername)
    .maybeSingle();

  if (profileErr) {
    return {
      ...emptyErrors,
      formError: isRlsOrPermissionError(profileErr)
        ? friendlyDbPermissionMessage()
        : profileErr.message,
    };
  }

  if (!profile?.id) {
    return { ...emptyErrors, formError: "Profile not found." };
  }

  if (profile.user_id !== user.id) {
    return {
      ...emptyErrors,
      formError: "You can only edit your own profile.",
    };
  }

  if (nextUsername !== currentUsername) {
    const { data: taken } = await supabase
      .from("profile")
      .select("user_id")
      .eq("username", nextUsername)
      .maybeSingle();

    if (taken && taken.user_id !== user.id) {
      return {
        ...emptyErrors,
        usernameError: "That username is already taken. Try another.",
      };
    }
  }

  const firstName = trimField(formText(formData, "first_name"), 80) || null;
  const lastName = trimField(formText(formData, "last_name"), 80) || null;
  const bio = trimField(formText(formData, "bio"), 2000);
  const tagline = trimField(formText(formData, "tagline"), TAGLINE_MAX);
  const quote = trimField(formText(formData, "quote"), QUOTE_MAX);
  const featuredSessionIds = parseFeaturedSessionIds(formData);

  if (featuredSessionIds.length > 0) {
    const { data: ownedPrograms, error: programsErr } = await supabase
      .from("programs")
      .select("id")
      .eq("profile_id", profile.id);

    if (programsErr) {
      return {
        ...emptyErrors,
        formError: isRlsOrPermissionError(programsErr)
          ? friendlyDbPermissionMessage()
          : programsErr.message,
      };
    }

    const programIds = (ownedPrograms ?? []).map((row) => row.id as string);
    if (programIds.length === 0) {
      return {
        ...emptyErrors,
        formError: "One or more featured sessions are not on your programs.",
      };
    }

    const { data: ownedSessions, error: sessionsErr } = await supabase
      .from("sessions")
      .select("id")
      .in("program_id", programIds)
      .in("id", featuredSessionIds);

    if (sessionsErr) {
      return {
        ...emptyErrors,
        formError: isRlsOrPermissionError(sessionsErr)
          ? friendlyDbPermissionMessage()
          : sessionsErr.message,
      };
    }

    const owned = new Set((ownedSessions ?? []).map((row) => row.id as string));
    if (featuredSessionIds.some((id) => !owned.has(id))) {
      return {
        ...emptyErrors,
        formError: "One or more featured sessions are not on your programs.",
      };
    }
  }

  const layout: ProfileViewPreference =
    parseProfileLayout(trimField(formText(formData, "profile_layout"), 32)) ??
    "full_content";

  const existingLinks = isRecord(profile.links) ? { ...profile.links } : {};
  delete existingLinks.channelUrl;
  delete existingLinks.hubLinks;

  const nextLinks: Record<string, unknown> = {
    ...existingLinks,
    profileViewPreference: layout,
  };

  const baseTags = isRecord(profile.tags) ? { ...profile.tags } : {};
  delete baseTags.profileViewPreference;

  const nextTags: Record<string, unknown> = {
    ...baseTags,
    tagline,
    quote,
    featuredSessionIds,
  };

  const clearBanner =
    trimField(formText(formData, "banner_clear"), 8) === "1";
  const bannerField = formText(formData, "banner_url");
  if (clearBanner) {
    delete nextTags.bannerUrl;
  } else if (bannerField !== null && bannerField.trim() !== "") {
    const parsedBanner = parseBannerUrlField(bannerField);
    if (!parsedBanner.ok) {
      return { ...emptyErrors, bannerError: parsedBanner.error };
    }
    if (parsedBanner.bannerUrl) {
      nextTags.bannerUrl = parsedBanner.bannerUrl;
    }
  }

  const rowUpdate: Record<string, unknown> = {
    username: nextUsername,
    first_name: firstName,
    last_name: lastName,
    bio: bio || "",
    links: nextLinks,
    tags: nextTags,
  };

  const avatarField = formText(formData, "avatar_url");
  if (avatarField !== null) {
    const parsedAvatar = parseAvatarUrlField(avatarField);
    if (!parsedAvatar.ok) {
      return { ...emptyErrors, avatarError: parsedAvatar.error };
    }
    if (parsedAvatar.avatarUrl) {
      rowUpdate.avatar_url = parsedAvatar.avatarUrl;
    }
  }

  const catalogOk =
    trimField(formText(formData, "interest_catalog_ok"), 8) === "1";

  if (catalogOk) {
    const resolvedTags = await resolveProfileTagIds(
      supabase,
      parseInterestTagIds(formData),
    );
    if (!resolvedTags.ok) {
      return { ...emptyErrors, interestsError: resolvedTags.error };
    }
    nextTags.tagIds = resolvedTags.tagIds;
    rowUpdate.tags = nextTags;
  }

  const { error: updErr } = await supabase.from("profile").update(rowUpdate)
    .eq("id", profile.id)
    .eq("user_id", user.id);

  if (updErr) {
    if (updErr.code === "23505") {
      return {
        ...emptyErrors,
        usernameError: "That username is already taken. Try another.",
      };
    }
    return {
      ...emptyErrors,
      formError: isRlsOrPermissionError(updErr)
        ? friendlyDbPermissionMessage()
        : updErr.message,
    };
  }

  if (nextUsername !== currentUsername) {
    await renameGumletFolderBestEffort(
      typeof profile.gumlet_folder_id === "string"
        ? profile.gumlet_folder_id
        : null,
      nextUsername,
    );
  }

  revalidatePath("/", "layout");
  revalidatePath(safeNextPath(`/${nextUsername}`));
  revalidatePath(safeNextPath(`/${nextUsername}/edit`));

  redirect(safeNextPath(`/${nextUsername}`));
}
