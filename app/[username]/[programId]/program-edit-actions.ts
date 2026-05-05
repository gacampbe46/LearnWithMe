"use server";

import { revalidatePath } from "next/cache";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import {
  friendlyDbPermissionMessage,
  isRlsOrPermissionError,
} from "@/lib/supabase/map-db-error";
import {
  assertProgramCatalogTopicIds,
  parseProgramCatalogTopicIdsFromForm,
} from "@/lib/program/program-catalog-topic-form";
import { parseProgramPriceFromForm } from "@/lib/program/program-price-form";
import {
  parseProgramTagsColumn,
  serializeProgramTags,
} from "@/lib/program/program-tags-json";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { currentUserCanManageProgram } from "@/lib/teach/can-manage-program";
import type { EditProgramBasicsState } from "./program-edit-actions-state";

function trimField(v: FormDataEntryValue | null, max: number): string {
  if (v == null || typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function formText(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  return typeof v === "string" ? v : null;
}

export async function updateProgramBasics(
  _prev: EditProgramBasicsState,
  formData: FormData,
): Promise<EditProgramBasicsState> {
  const username = trimField(formText(formData, "username"), 80);
  const programId = trimField(formText(formData, "program_id"), 64);

  if (!username || !programId) {
    return { formError: "Missing program reference." };
  }

  const canManage = await currentUserCanManageProgram(programId);
  if (!canManage) {
    return { formError: "You cannot edit this program." };
  }

  const title = trimField(formText(formData, "title"), 240);
  if (!title) {
    return { formError: "Title is required." };
  }

  const description = trimField(formText(formData, "description"), 8000);
  const priceRaw = trimField(formText(formData, "price"), 32);
  const priceParsed = parseProgramPriceFromForm(priceRaw);
  if (!priceParsed.ok) {
    return { formError: priceParsed.message };
  }

  const topicIds = parseProgramCatalogTopicIdsFromForm(formData);
  const supabase = await createSupabaseServerClient();
  const tagCheck = await assertProgramCatalogTopicIds(supabase, topicIds);
  if (!tagCheck.ok) {
    return { formError: tagCheck.message };
  }

  /** Same as create: omit tags JSON when none selected (nullable column). */
  const tagsPayload =
    topicIds.length > 0 ? serializeProgramTags(topicIds) : null;

  /** Avoid `.update().select()` — RETURNING can be empty under SELECT RLS even when UPDATE applies. */
  const { error } = await supabase
    .from("programs")
    .update({
      title,
      description: description || null,
      price: priceParsed.value,
      tags: tagsPayload,
    })
    .eq("id", programId);

  if (error) {
    return {
      formError: isRlsOrPermissionError(error)
        ? friendlyDbPermissionMessage()
        : error.message,
    };
  }

  const { data: check, error: checkErr } = await supabase
    .from("programs")
    .select("title, description, price, tags")
    .eq("id", programId)
    .maybeSingle();

  if (checkErr) {
    return {
      formError: isRlsOrPermissionError(checkErr)
        ? friendlyDbPermissionMessage()
        : checkErr.message,
    };
  }

  if (!check) {
    return {
      formError:
        "Could not save: no program row returned after update. Run `tools/sql/run-all-owner-policies.sql` in Supabase → SQL Editor.",
    };
  }

  const savedTags = [...parseProgramTagsColumn(check.tags)].sort().join("\0");
  const wantTags = [...topicIds].sort().join("\0");
  const persisted =
    check.title === title &&
    (check.description ?? "") === (description || "") &&
    Number(check.price) === priceParsed.value &&
    savedTags === wantTags;

  if (!persisted) {
    return {
      formError:
        "Could not save: changes didn’t persist. Run `tools/sql/run-all-owner-policies.sql` in Supabase → SQL Editor.",
    };
  }

  const managePath = safeNextPath(`/${username}/${programId}/manage`);
  revalidatePath(managePath);
  revalidatePath(safeNextPath(`/${username}/${programId}`));

  return {
    formError: null,
    redirectTo: managePath,
    savedAt: Date.now(),
  };
}
