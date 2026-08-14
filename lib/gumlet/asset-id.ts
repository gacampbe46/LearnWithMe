/** Gumlet asset IDs are 24-character hex (Mongo-style). */
const GUMLET_ASSET_ID_RE = /^[a-f0-9]{24}$/i;

export type VideoStatus = "processing" | "ready" | "errored";

export function parseGumletAssetId(
  value: string | null | undefined,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!GUMLET_ASSET_ID_RE.test(trimmed)) return null;
  return trimmed.toLowerCase();
}

export function parseVideoStatus(value: unknown): VideoStatus | null {
  if (value === "processing" || value === "ready" || value === "errored") {
    return value;
  }
  return null;
}

export function parseThumbnailUrl(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.startsWith("https://") ? trimmed : null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const parsed = parseThumbnailUrl(item);
      if (parsed) return parsed;
    }
  }
  return null;
}
