import type { SupabaseClient } from "@supabase/supabase-js";

export type InterestTagOption = { id: string; label: string };

export type InterestTagsLoadResult = {
  options: InterestTagOption[];
  /** Set when the query fails (e.g. RLS blocks SELECT). */
  error: string | null;
};

function isOtherTagLabel(label: string): boolean {
  return label.trim().toLowerCase() === "other";
}

/** Alphabetical by label, with tag named "Other" (any case) always last. */
function sortInterestTagOptions(rows: InterestTagOption[]): InterestTagOption[] {
  const others = rows.filter((r) => isOtherTagLabel(r.label));
  const rest = rows.filter((r) => !isOtherTagLabel(r.label));
  rest.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  return [...rest, ...others];
}

/** All rows from `public.tags` (id + name) — catalog for chips / interests. */
export async function listInterestTagOptions(
  supabase: SupabaseClient,
): Promise<InterestTagsLoadResult> {
  const { data, error } = await supabase.from("tags").select("id, name");

  if (error) {
    return { options: [], error: error.message };
  }

  if (!data) {
    return { options: [], error: null };
  }

  const rows: InterestTagOption[] = [];
  for (const row of data) {
    if (typeof row.id !== "string") continue;
    const name =
      typeof row.name === "string" && row.name.trim() ? row.name.trim() : null;
    if (!name) continue;
    rows.push({ id: row.id, label: name });
  }

  return { options: sortInterestTagOptions(rows), error: null };
}
