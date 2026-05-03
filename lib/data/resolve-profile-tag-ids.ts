import type { SupabaseClient } from "@supabase/supabase-js";
import {
  friendlyDbPermissionMessage,
  isRlsOrPermissionError,
} from "@/lib/supabase/map-db-error";

/**
 * Ensures every id exists in `public.tags` and at least one is selected.
 * Returned `tagIds` is sorted for stable JSON in `profile.tags`.
 */
export async function resolveProfileTagIds(
  supabase: SupabaseClient,
  candidateIds: string[],
): Promise<{ ok: true; tagIds: string[] } | { ok: false; error: string }> {
  if (candidateIds.length === 0) {
    return { ok: false, error: "Select at least one interest." };
  }

  const { data, error } = await supabase
    .from("tags")
    .select("id")
    .in("id", candidateIds);

  if (error) {
    return {
      ok: false,
      error: isRlsOrPermissionError(error)
        ? friendlyDbPermissionMessage()
        : error.message,
    };
  }

  const found = new Set(
    (data ?? [])
      .map((r) => r.id)
      .filter((id): id is string => typeof id === "string"),
  );

  const missing = candidateIds.filter((id) => !found.has(id));
  if (missing.length > 0) {
    return {
      ok: false,
      error:
        "Some interests are no longer available. Refresh the page and try again.",
    };
  }

  const tagIds = [...candidateIds].sort();
  return { ok: true, tagIds };
}
