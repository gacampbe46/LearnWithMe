"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { profileNeedsOnboarding } from "@/lib/auth/profile-onboarding";
import { resolveProfileTagIds } from "@/lib/data/resolve-profile-tag-ids";
import { parseInterestTagIds } from "@/lib/onboarding/form-tags";
import { parseAndValidateUsername } from "@/lib/onboarding/username";
import {
  friendlyDbPermissionMessage,
  isRlsOrPermissionError,
} from "@/lib/supabase/map-db-error";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  mergeOnboardingState,
  type OnboardingFormState,
} from "./onboarding-state";

function trimField(v: FormDataEntryValue | null, max: number): string {
  if (v == null || typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function formText(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  return typeof v === "string" ? v : null;
}

export async function completeOnboarding(
  _prev: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return mergeOnboardingState({
      formError: "You are not signed in. Sign in and try again.",
    });
  }

  const stillNeeds = await profileNeedsOnboarding(supabase);
  if (!stillNeeds) {
    redirect(safeNextPath(formText(formData, "next")));
  }

  const usernameCheck = parseAndValidateUsername(formText(formData, "username"));
  if (!usernameCheck.ok) {
    return mergeOnboardingState({ usernameError: usernameCheck.message });
  }
  const { normalized: username } = usernameCheck;

  const firstName = trimField(formText(formData, "first_name"), 80);
  const lastName = trimField(formText(formData, "last_name"), 80);
  const bio = trimField(formText(formData, "bio"), 2000);
  const interestCandidates = parseInterestTagIds(formData);

  const resolvedTags = await resolveProfileTagIds(supabase, interestCandidates);
  if (!resolvedTags.ok) {
    return mergeOnboardingState({ interestsError: resolvedTags.error });
  }

  const { data: taken } = await supabase
    .from("profile")
    .select("user_id")
    .eq("username", username)
    .maybeSingle();

  if (taken && taken.user_id !== user.id) {
    return mergeOnboardingState({
      usernameError: "That username is already taken. Try another.",
    });
  }

  const { data: existingProfile, error: existingErr } = await supabase
    .from("profile")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingErr) {
    return mergeOnboardingState({
      formError: isRlsOrPermissionError(existingErr)
        ? friendlyDbPermissionMessage()
        : existingErr.message,
    });
  }

  const profilePayload = {
    user_id: user.id,
    username,
    first_name: firstName || null,
    last_name: lastName || null,
    bio: bio || "",
    links: {},
    tags: {
      profileViewPreference: "full_content" as const,
      tagIds: resolvedTags.tagIds,
    },
    is_instructor: false,
  };

  if (existingProfile?.id) {
    const { error: updErr } = await supabase
      .from("profile")
      .update({
        username: profilePayload.username,
        first_name: profilePayload.first_name,
        last_name: profilePayload.last_name,
        bio: profilePayload.bio,
        links: profilePayload.links,
        tags: profilePayload.tags,
        is_instructor: profilePayload.is_instructor,
      })
      .eq("id", existingProfile.id)
      .eq("user_id", user.id);

    if (updErr) {
      if (updErr.code === "23505") {
        return mergeOnboardingState({
          usernameError: "That username is already taken. Try another.",
        });
      }
      return mergeOnboardingState({
        formError: isRlsOrPermissionError(updErr)
          ? friendlyDbPermissionMessage()
          : updErr.message,
      });
    }
  } else {
    const { error: insErr } = await supabase
      .from("profile")
      .insert(profilePayload)
      .select("id")
      .single();

    if (insErr) {
      if (insErr.code === "23505") {
        return mergeOnboardingState({
          usernameError: "That username is already taken. Try another.",
        });
      }
      return mergeOnboardingState({
        formError: isRlsOrPermissionError(insErr)
          ? friendlyDbPermissionMessage()
          : insErr.message,
      });
    }
  }

  redirect(safeNextPath(formText(formData, "next")));
}
