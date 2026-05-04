"use server";

import { redirect } from "next/navigation";
import {
  friendlyDbPermissionMessage,
  isRlsOrPermissionError,
} from "@/lib/supabase/map-db-error";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { currentUserCanManageProgram } from "@/lib/teach/can-manage-program";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import type { AddSessionFormState } from "./add-session-form-state";

function trimField(v: FormDataEntryValue | null, max: number): string {
  if (v == null || typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function formText(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  return typeof v === "string" ? v : null;
}

export async function addProgramSession(
  _prev: AddSessionFormState,
  formData: FormData,
): Promise<AddSessionFormState> {
  const username = trimField(formText(formData, "username"), 80);
  const programId = trimField(formText(formData, "program_id"), 64);
  const backPath =
    username && programId ? `/${username}/${programId}/manage` : "/";

  if (!username || !programId) {
    return { formError: "Missing program. Go back and try again." };
  }

  const canManage = await currentUserCanManageProgram(programId);
  if (!canManage) {
    return { formError: "You can only add sessions to your own programs." };
  }

  const title = trimField(formText(formData, "title"), 280);
  if (!title) {
    return { formError: "Give this session a title." };
  }

  const description = trimField(formText(formData, "description"), 8000);
  const contentUrl = trimField(formText(formData, "content_url"), 2000);

  if (!contentUrl) {
    return {
      formError:
        "Add a video link or YouTube ID so learners have something to follow.",
    };
  }

  const supabase = await createSupabaseServerClient();

  const { data: orderRow } = await supabase
    .from("sessions")
    .select("sort_order")
    .eq("program_id", programId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const maxOrder =
    typeof orderRow?.sort_order === "number" && Number.isFinite(orderRow.sort_order)
      ? orderRow.sort_order
      : -1;
  const sortOrder = maxOrder + 1;

  const { error: insertErr } = await supabase.from("sessions").insert({
    program_id: programId,
    title,
    description: description || null,
    content_url: contentUrl,
    sort_order: sortOrder,
  });

  if (insertErr) {
    const baseMsg = isRlsOrPermissionError(insertErr)
      ? friendlyDbPermissionMessage()
      : insertErr.message;
    const hint =
      process.env.NODE_ENV === "development" && insertErr.message
        ? ` (${insertErr.message})`
        : "";
    return { formError: `${baseMsg}${hint}` };
  }

  redirect(safeNextPath(backPath));
}

export async function updateProgramSession(
  _prev: AddSessionFormState,
  formData: FormData,
): Promise<AddSessionFormState> {
  const username = trimField(formText(formData, "username"), 80);
  const programId = trimField(formText(formData, "program_id"), 64);
  const sessionId = trimField(formText(formData, "session_id"), 64);
  const backPath =
    username && programId ? `/${username}/${programId}/manage` : "/";

  if (!username || !programId || !sessionId) {
    return { formError: "Missing session or program. Go back and try again." };
  }

  const canManage = await currentUserCanManageProgram(programId);
  if (!canManage) {
    return { formError: "You can only edit sessions on your own programs." };
  }

  const title = trimField(formText(formData, "title"), 280);
  if (!title) {
    return { formError: "Give this session a title." };
  }

  const description = trimField(formText(formData, "description"), 8000);
  const contentUrl = trimField(formText(formData, "content_url"), 2000);

  if (!contentUrl) {
    return {
      formError:
        "Add a video link or YouTube ID so learners have something to follow.",
    };
  }

  const supabase = await createSupabaseServerClient();

  const { data: sess, error: readErr } = await supabase
    .from("sessions")
    .select("program_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (readErr) {
    const baseMsg = isRlsOrPermissionError(readErr)
      ? friendlyDbPermissionMessage()
      : readErr.message;
    const hint =
      process.env.NODE_ENV === "development" && readErr.message
        ? ` (${readErr.message})`
        : "";
    return { formError: `${baseMsg}${hint}` };
  }

  if (!sess || sess.program_id !== programId) {
    return {
      formError: "This session wasn’t found for this program.",
    };
  }

  const { error: updateErr } = await supabase
    .from("sessions")
    .update({
      title,
      description: description || null,
      content_url: contentUrl,
    })
    .eq("id", sessionId)
    .eq("program_id", programId);

  if (updateErr) {
    const baseMsg = isRlsOrPermissionError(updateErr)
      ? friendlyDbPermissionMessage()
      : updateErr.message;
    const hint =
      process.env.NODE_ENV === "development" && updateErr.message
        ? ` (${updateErr.message})`
        : "";
    return { formError: `${baseMsg}${hint}` };
  }

  redirect(safeNextPath(backPath));
}
