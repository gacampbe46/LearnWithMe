import {
  isAvatarStoragePublicUrl,
  stripAvatarUrlCacheBust,
  withAvatarCacheBust,
} from "@/lib/profile/avatar-storage";

export type ParseAvatarUrlResult =
  | { ok: true; avatarUrl: string | null }
  | { ok: false; error: string };

export function parseAvatarUrlField(raw: string | null): ParseAvatarUrlResult {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) {
    return { ok: true, avatarUrl: null };
  }

  if (!isAvatarStoragePublicUrl(trimmed)) {
    return {
      ok: false,
      error: "Invalid profile picture. Upload again and try once more.",
    };
  }

  const canonical = stripAvatarUrlCacheBust(trimmed);
  return { ok: true, avatarUrl: withAvatarCacheBust(canonical) };
}
