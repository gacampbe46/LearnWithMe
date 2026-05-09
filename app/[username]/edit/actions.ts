"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import type { ProfileViewPreference } from "@/lib/member/types";
import { resolveProfileTagIds } from "@/lib/catalog/resolve-profile-tag-ids";
import { parseInterestTagIds } from "@/lib/onboarding/form-tags";
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

export type ProfileUpdateState = {
  formError: string | null;
  interestsError: string | null;
};

export async function updateProfileByUsername(
  _prev: ProfileUpdateState,
  formData: FormData,
): Promise<ProfileUpdateState> {
  const username = trimField(formText(formData, "username"), 80).toLowerCase();
  if (!username) {
    return { formError: "Missing username.", interestsError: null };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      formError: "You are not signed in. Sign in and try again.",
      interestsError: null,
    };
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profile")
    .select("id, user_id, links, tags")
    .eq("username", username)
    .maybeSingle();

  if (profileErr) {
    return {
      formError: isRlsOrPermissionError(profileErr)
        ? friendlyDbPermissionMessage()
        : profileErr.message,
      interestsError: null,
    };
  }

  if (!profile?.id) {
    return { formError: "Profile not found.", interestsError: null };
  }

  if (profile.user_id !== user.id) {
    return {
      formError: "You can only edit your own profile.",
      interestsError: null,
    };
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
      return { formError: null, interestsError: resolvedTags.error };
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
    return {
      formError: isRlsOrPermissionError(updErr)
        ? friendlyDbPermissionMessage()
        : updErr.message,
      interestsError: null,
    };
  }

  redirect(safeNextPath(`/${username}`));
}
