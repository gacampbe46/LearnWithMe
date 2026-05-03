const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_INTERESTS = 24;

/** Checkbox group `name="interest"` values = tag ids. */
export function parseInterestTagIds(formData: FormData): string[] {
  const raw = formData.getAll("interest");
  const ids: string[] = [];
  for (const v of raw) {
    if (typeof v !== "string") continue;
    const t = v.trim();
    if (!UUID_RE.test(t)) continue;
    ids.push(t);
  }
  return [...new Set(ids)].slice(0, MAX_INTERESTS);
}
