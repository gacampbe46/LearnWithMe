"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import type { ProfileViewPreference } from "@/lib/member/types";
import { resolveProfileTagIds } from "@/lib/catalog/resolve-profile-tag-ids";
import { parseInterestTagIds } from "@/lib/onboarding/form-tags";
import { parseAndValidateUsername } from "@/lib/onboarding/username";
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

const emptyErrors: ProfileUpdateState = {
  formError: null,
  usernameError: null,
  interestsError: null,
};

export type ProfileUpdateState = {
  formError: string | null;
  usernameError: string | null;
  interestsError: string | null;
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
    .select("id, user_id, links, tags")
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

  const rowUpdate: Record<string, unknown> = {
    username: nextUsername,
    first_name: firstName,
    last_name: lastName,
    bio: bio || "",
    links: nextLinks,
  };

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
    const baseTags = isRecord(profile.tags) ? { ...profile.tags } : {};
    delete baseTags.profileViewPreference;
    rowUpdate.tags = {
      ...baseTags,
      tagIds: resolvedTags.tagIds,
    };
  } else if (
    isRecord(profile.tags) &&
    profile.tags.profileViewPreference !== undefined
  ) {
    const nextTags = { ...profile.tags };
    delete nextTags.profileViewPreference;
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

  redirect(safeNextPath(`/${nextUsername}`));
}
