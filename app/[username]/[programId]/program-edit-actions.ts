"use server";

import { revalidatePath } from "next/cache";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import {
  friendlyDbPermissionMessage,
  friendlyLearnerVisibilityRlsMessage,
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

  const isActiveRaw = trimField(formText(formData, "is_active"), 8);
  let wantActive = isActiveRaw === "true";

  const { count: sessionCount, error: sessionCountErr } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("program_id", programId);

  if (sessionCountErr) {
    return {
      formError: isRlsOrPermissionError(sessionCountErr)
        ? friendlyDbPermissionMessage()
        : sessionCountErr.message,
    };
  }

  if (wantActive && (sessionCount ?? 0) < 1) {
    wantActive = false;
  }

  const programViewPath = safeNextPath(`/${username}/${programId}`);

  const { data: existing, error: readErr } = await supabase
    .from("programs")
    .select("title, description, price, tags, is_active")
    .eq("id", programId)
    .maybeSingle();

  if (readErr) {
    return {
      formError: isRlsOrPermissionError(readErr)
        ? friendlyDbPermissionMessage()
        : readErr.message,
    };
  }

  if (!existing) {
    return { formError: "This program wasn’t found." };
  }

  const existingTags = [...parseProgramTagsColumn(existing.tags)].sort().join("\0");
  const wantTags = [...topicIds].sort().join("\0");
  const currentActive = existing.is_active === true;
  const basicsUnchanged =
    existing.title === title &&
    (existing.description ?? "") === (description || "") &&
    Number(existing.price) === priceParsed.value &&
    existingTags === wantTags;
  const visibilityUnchanged = wantActive === currentActive;

  if (basicsUnchanged && visibilityUnchanged) {
    return { formError: null };
  }

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
    .select("title, description, price, tags, is_active")
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
  let basicsPersisted =
    check.title === title &&
    (check.description ?? "") === (description || "") &&
    Number(check.price) === priceParsed.value &&
    savedTags === wantTags;

  if (!basicsPersisted) {
    return {
      formError:
        "Could not save: changes didn’t persist. Run `tools/sql/run-all-owner-policies.sql` in Supabase → SQL Editor.",
    };
  }

  if (wantActive !== currentActive) {
    const { data: rpcOk, error: rpcErr } = await supabase.rpc(
      "set_program_is_active",
      {
        p_program_id: programId,
        p_active: wantActive,
      },
    );

    if (rpcErr) {
      const rpcMsg = rpcErr.message ?? "";
      const missingFn =
        rpcErr.code === "42883" ||
        /does not exist/i.test(rpcMsg) ||
        (/function/i.test(rpcMsg) && /set_program_is_active/i.test(rpcMsg));

      if (missingFn) {
        return {
          formError:
            "Database is missing function `set_program_is_active`. Paste and run the latest `tools/sql/run-all-owner-policies.sql` in Supabase SQL Editor (bottom section), then try again.",
        };
      }

      return {
        formError: isRlsOrPermissionError(rpcErr)
          ? friendlyLearnerVisibilityRlsMessage()
          : rpcErr.message,
      };
    }

    if (rpcOk !== true) {
      return { formError: friendlyLearnerVisibilityRlsMessage() };
    }
  }

  const { data: finalCheck, error: finalCheckErr } = await supabase
    .from("programs")
    .select("is_active")
    .eq("id", programId)
    .maybeSingle();

  if (finalCheckErr) {
    return {
      formError: isRlsOrPermissionError(finalCheckErr)
        ? friendlyDbPermissionMessage()
        : finalCheckErr.message,
    };
  }

  const finalActive = finalCheck?.is_active === true;
  if (!finalCheck || finalActive !== wantActive) {
    return { formError: friendlyLearnerVisibilityRlsMessage() };
  }

  revalidatePath(safeNextPath(`/${username}/${programId}/manage`));
  revalidatePath(programViewPath);
  revalidatePath(safeNextPath(`/${username}`));

  return {
    formError: null,
    redirectTo: programViewPath,
    savedAt: Date.now(),
  };
}
