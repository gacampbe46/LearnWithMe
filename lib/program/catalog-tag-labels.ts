import type { SupabaseClient } from "@supabase/supabase-js";

/** Resolve `tags.id` → display `name` from `public.tags`. */
export async function fetchCatalogTagLabelMap(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) return map;

  const { data, error } = await supabase
    .from("tags")
    .select("id, name")
    .in("id", unique);

  if (error || !data) return map;

  for (const row of data) {
    if (typeof row.id === "string" && typeof row.name === "string") {
      const name = row.name.trim();
      if (name) map.set(row.id, name);
    }
  }
  return map;
}
