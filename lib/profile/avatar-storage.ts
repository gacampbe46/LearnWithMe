export const AVATAR_BUCKET = "avatars";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** 2 MB — matches bucket `file_size_limit` in migration. */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export function avatarObjectPath(userId: string, mimeType: string): string | null {
  const ext = MIME_TO_EXT[mimeType];
  if (!ext) return null;
  return `${userId}/avatar.${ext}`;
}

/** Every allowed avatar filename for a user — used to remove stale formats on re-upload. */
export function allAvatarObjectPaths(userId: string): string[] {
  return [...new Set(Object.values(MIME_TO_EXT))].map(
    (ext) => `${userId}/avatar.${ext}`,
  );
}

export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Use a JPEG, PNG, WebP, or GIF image.";
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return "Image must be 2 MB or smaller.";
  }
  return null;
}

/** Strip cache-bust query params before comparing or storing a canonical path. */
export function stripAvatarUrlCacheBust(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("t");
    parsed.searchParams.delete("v");
    return parsed.toString();
  } catch {
    return url.split("?")[0] ?? url;
  }
}

export function isAvatarStoragePublicUrl(url: string): boolean {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return false;

  try {
    const parsed = new URL(stripAvatarUrlCacheBust(url));
    const expectedPrefix = `${base}/storage/v1/object/public/${AVATAR_BUCKET}/`;
    return parsed.href.startsWith(expectedPrefix);
  } catch {
    return false;
  }
}

export function withAvatarCacheBust(publicUrl: string): string {
  const base = stripAvatarUrlCacheBust(publicUrl);
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}t=${Date.now()}`;
}
