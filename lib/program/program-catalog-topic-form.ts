import type { SupabaseClient } from "@supabase/supabase-js";
import {
  friendlyDbPermissionMessage,
  isRlsOrPermissionError,
} from "@/lib/supabase/map-db-error";

/**
 * Checkbox `name` for program topic chips — MUST match create + edit UI
 * (`program-create-form`, `edit-program-panel`).
 */
export const PROGRAM_CATALOG_TOPIC_FIELD = "catalog_topic";

export const MAX_PROGRAM_CATALOG_TOPIC_SELECTIONS = 24;

export function parseProgramCatalogTopicIdsFromForm(
  formData: FormData,
): string[] {
  const raw = formData.getAll(PROGRAM_CATALOG_TOPIC_FIELD);
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const entry of raw) {
    if (typeof entry !== "string") continue;
    const id = entry.trim().slice(0, 64);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
    if (ids.length >= MAX_PROGRAM_CATALOG_TOPIC_SELECTIONS) break;
  }
  return ids;
}

export async function assertProgramCatalogTopicIds(
  supabase: SupabaseClient,
  ids: string[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (ids.length === 0) return { ok: true };

  const { data, error } = await supabase.from("tags").select("id").in("id", ids);

  if (error) {
    return {
      ok: false,
      message: isRlsOrPermissionError(error)
        ? friendlyDbPermissionMessage()
        : error.message,
    };
  }

  const found = new Set(
    (data ?? [])
      .filter((row) => typeof row.id === "string")
      .map((row) => row.id),
  );
  if (found.size !== ids.length) {
    return { ok: false, message: "One or more selected topics are not valid." };
  }

  return { ok: true };
}
