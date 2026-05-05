/** Shape written to `programs.tags` (JSON column). */
export type ProgramTagsJson = { tagIds: string[] };

export function parseProgramTagsColumn(value: unknown): string[] {
  if (value == null) return [];
  if (typeof value === "string") {
    try {
      return parseProgramTagsColumn(JSON.parse(value) as unknown);
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) {
    return value.filter(
      (x): x is string => typeof x === "string" && x.trim().length > 0,
    );
  }
  if (typeof value === "object" && value !== null && "tagIds" in value) {
    const ar = (value as { tagIds?: unknown }).tagIds;
    if (Array.isArray(ar)) {
      return ar.filter(
        (x): x is string => typeof x === "string" && x.trim().length > 0,
      );
    }
  }
  return [];
}

export function serializeProgramTags(tagIds: string[]): ProgramTagsJson {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of tagIds) {
    const t = id.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return { tagIds: out };
}
