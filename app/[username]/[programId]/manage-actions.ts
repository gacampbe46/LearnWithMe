"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import {
  friendlyDbPermissionMessage,
  friendlyLearnerVisibilityRlsMessage,
  isRlsOrPermissionError,
} from "@/lib/supabase/map-db-error";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { currentUserCanManageProgram } from "@/lib/teach/can-manage-program";
import type { FlipVisibilityState } from "./manage-visibility-state";

function trimField(v: FormDataEntryValue | null, max: number): string {
  if (v == null || typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function formText(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  return typeof v === "string" ? v : null;
}

/** Single control: flips `is_active` from current DB value (for toggle UI). */
export async function flipLearnerVisibility(
  _prev: FlipVisibilityState,
  formData: FormData,
): Promise<FlipVisibilityState> {
  const username = trimField(formText(formData, "username"), 80);
  const programId = trimField(formText(formData, "program_id"), 64);

  if (!username || !programId) {
    return { formError: "Something went wrong. Try again." };
  }

  const canManage = await currentUserCanManageProgram(programId);
  if (!canManage) {
    return { formError: "You can’t change visibility for this program." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: row, error: readErr } = await supabase
    .from("programs")
    .select("is_active")
    .eq("id", programId)
    .maybeSingle();

  if (readErr) {
    return {
      formError: isRlsOrPermissionError(readErr)
        ? friendlyLearnerVisibilityRlsMessage()
        : readErr.message,
    };
  }

  if (!row || typeof row !== "object") {
    return { formError: "Program not found." };
  }

  const currentlyVisible = row.is_active !== false;
  const nextActive = !currentlyVisible;

  /**
   * Prefer DB RPC: ownership is enforced inside Postgres (`SECURITY DEFINER`), so a messy
   * RLS policy stack on `programs` can’t block `is_active` updates after policies ran.
   */
  const { data: rpcOk, error: rpcErr } = await supabase.rpc("set_program_is_active", {
    p_program_id: programId,
    p_active: nextActive,
  });

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

  redirect(safeNextPath(`/${username}/${programId}/manage`));
}

export async function reorderProgramSessions(payload: {
  programId: string;
  orderedSessionIds: string[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const programId =
    typeof payload.programId === "string" ? payload.programId.trim().slice(0, 64) : "";
  const ordered = payload.orderedSessionIds;

  if (!programId) {
    return { ok: false, error: "Missing program." };
  }
  if (!Array.isArray(ordered) || ordered.length === 0) {
    return { ok: false, error: "Nothing to reorder." };
  }
  const normalized = ordered
    .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    .map((id) => id.trim().slice(0, 64));
  if (normalized.length !== ordered.length) {
    return { ok: false, error: "Invalid session list." };
  }

  const canManage = await currentUserCanManageProgram(programId);
  if (!canManage) {
    return { ok: false, error: "You can only reorder sessions on your own programs." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: rows, error: readErr } = await supabase
    .from("sessions")
    .select("id")
    .eq("program_id", programId);

  if (readErr) {
    const msg = isRlsOrPermissionError(readErr)
      ? friendlyDbPermissionMessage()
      : readErr.message;
    return { ok: false, error: msg };
  }

  const dbIds = new Set(
    (rows ?? []).filter((r) => typeof r.id === "string").map((r) => r.id),
  );
  if (
    dbIds.size !== normalized.length ||
    !normalized.every((id) => dbIds.has(id))
  ) {
    return {
      ok: false,
      error:
        "The session list doesn’t match the server anymore. Refresh the page and try again.",
    };
  }

  /** Staging avoids duplicate `sort_order` values mid-flight when a uniqueness constraint exists. */
  const STAGING_BASE = 1_000_000;

  const stageResults = await Promise.all(
    normalized.map((id, index) =>
      supabase
        .from("sessions")
        .update({ sort_order: STAGING_BASE + index })
        .eq("id", id)
        .eq("program_id", programId),
    ),
  );
  const stageErr = stageResults.find((r) => r.error)?.error;
  if (stageErr) {
    const msg = isRlsOrPermissionError(stageErr)
      ? friendlyDbPermissionMessage()
      : stageErr.message;
    return { ok: false, error: msg };
  }

  for (let i = 0; i < normalized.length; i++) {
    const id = normalized[i]!;
    const { error } = await supabase
      .from("sessions")
      .update({ sort_order: i })
      .eq("id", id)
      .eq("program_id", programId);
    if (error) {
      const msg = isRlsOrPermissionError(error)
        ? friendlyDbPermissionMessage()
        : error.message;
      return { ok: false, error: msg };
    }
  }

  return { ok: true };
}

export async function deleteProgramCascade(formData: FormData): Promise<void> {
  const username = trimField(formText(formData, "username"), 80);
  const programId = trimField(formText(formData, "program_id"), 64);
  const confirmed = formText(formData, "confirm_delete");

  if (!username || !programId || confirmed !== "yes") {
    redirect(username ? safeNextPath(`/${username}/${programId}/manage`) : "/");
  }

  const canManage = await currentUserCanManageProgram(programId);
  if (!canManage) {
    redirect("/");
  }

  const supabase = await createSupabaseServerClient();

  const delSessions = await supabase
    .from("sessions")
    .delete()
    .eq("program_id", programId);
  if (delSessions.error) {
    throw new Error(
      isRlsOrPermissionError(delSessions.error)
        ? friendlyDbPermissionMessage()
        : delSessions.error.message,
    );
  }

  const delProgram = await supabase.from("programs").delete().eq("id", programId);
  if (delProgram.error) {
    throw new Error(
      isRlsOrPermissionError(delProgram.error)
        ? friendlyDbPermissionMessage()
        : delProgram.error.message,
    );
  }

  redirect(safeNextPath(`/${username}`));
}
