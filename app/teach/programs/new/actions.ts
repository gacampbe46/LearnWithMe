"use server";

import { redirect } from "next/navigation";
import {
  friendlyDbPermissionMessage,
  isRlsOrPermissionError,
} from "@/lib/supabase/map-db-error";
import {
  assertProgramCatalogTopicIds,
  parseProgramCatalogTopicIdsFromForm,
} from "@/lib/program/program-catalog-topic-form";
import { parseProgramPriceFromForm } from "@/lib/program/program-price-form";
import { serializeProgramTags } from "@/lib/program/program-tags-json";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTeachingProfile } from "@/lib/teach/teaching-profile";
import type { ProgramCreateFormState } from "./program-create-state";

function trimField(v: FormDataEntryValue | null, max: number): string {
  if (v == null || typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function formText(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  return typeof v === "string" ? v : null;
}

export async function enableInstructorForCurrentUser(): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You are not signed in." };
  }

  const { error } = await supabase
    .from("profile")
    .update({ is_instructor: true })
    .eq("user_id", user.id);

  if (error) {
    return {
      ok: false,
      error: isRlsOrPermissionError(error)
        ? friendlyDbPermissionMessage()
        : error.message,
    };
  }

  return { ok: true, error: null };
}

export async function createProgram(
  _prev: ProgramCreateFormState,
  formData: FormData,
): Promise<ProgramCreateFormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { formError: "You are not signed in. Sign in and try again." };
  }

  const profile = await getTeachingProfile(supabase, user.id);
  if (!profile) {
    return {
      formError: "Finish setting up your public profile before creating a program.",
    };
  }

  if (!profile.isInstructor) {
    return {
      formError: "Turn on instructor access below before publishing a program.",
    };
  }

  const title = trimField(formText(formData, "title"), 240);
  if (!title) {
    return { formError: "Give your program a title." };
  }

  const description = trimField(formText(formData, "description"), 8000);

  const priceRaw = trimField(formText(formData, "price"), 32);
  const priceParsed = parseProgramPriceFromForm(priceRaw);
  if (!priceParsed.ok) {
    return { formError: priceParsed.message };
  }

  const topicIds = parseProgramCatalogTopicIdsFromForm(formData);
  const topicValidation = await assertProgramCatalogTopicIds(supabase, topicIds);
  if (!topicValidation.ok) {
    return { formError: topicValidation.message };
  }

  const tagsPayload =
    topicIds.length > 0 ? serializeProgramTags(topicIds) : null;

  const { data: inserted, error: insertErr } = await supabase
    .from("programs")
    .insert({
      profile_id: profile.id,
      title,
      description: description || null,
      price: priceParsed.value,
      is_active: true,
      tags: tagsPayload,
    })
    .select("id")
    .single();

  if (insertErr) {
    return {
      formError: isRlsOrPermissionError(insertErr)
        ? friendlyDbPermissionMessage()
        : insertErr.message,
    };
  }

  if (!inserted?.id) {
    return { formError: "Could not create the program. Try again." };
  }

  redirect(`/${profile.username}/${inserted.id}`);
}
