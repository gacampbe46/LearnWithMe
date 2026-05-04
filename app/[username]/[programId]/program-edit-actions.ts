"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import {
  friendlyDbPermissionMessage,
  isRlsOrPermissionError,
} from "@/lib/supabase/map-db-error";
import {
  assertProgramCatalogTopicIds,
  parseProgramCatalogTopicIdsFromForm,
} from "@/lib/program/program-catalog-topic-form";
import { serializeProgramTags } from "@/lib/program/program-tags-json";
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

function parsePrice(raw: string): { ok: true; value: number } | { ok: false; message: string } {
  const cleaned = raw.trim().replace(/^\$/, "");
  if (cleaned === "") {
    return { ok: false, message: "Enter a price (use 0 for free)." };
  }
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n) || n < 0) {
    return { ok: false, message: "Price must be zero or a positive number." };
  }
  return { ok: true, value: n };
}

function redirectAfterProgramEdit(username: string, programId: string): never {
  redirect(safeNextPath(`/${username}/${programId}/manage`));
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
  const priceParsed = parsePrice(priceRaw);
  if (!priceParsed.ok) {
    return { formError: priceParsed.message };
  }

  const topicIds = parseProgramCatalogTopicIdsFromForm(formData);
  const supabase = await createSupabaseServerClient();
  const tagCheck = await assertProgramCatalogTopicIds(supabase, topicIds);
  if (!tagCheck.ok) {
    return { formError: tagCheck.message };
  }

  const tagsJson = serializeProgramTags(topicIds);

  const { error } = await supabase
    .from("programs")
    .update({
      title,
      description: description || null,
      price: priceParsed.value,
      tags: tagsJson,
    })
    .eq("id", programId);

  if (error) {
    return {
      formError: isRlsOrPermissionError(error)
        ? friendlyDbPermissionMessage()
        : error.message,
    };
  }

  redirectAfterProgramEdit(username, programId);
}
