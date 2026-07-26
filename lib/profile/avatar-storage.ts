export const AVATAR_BUCKET = "avatars";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const AVATAR_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** 2 MB — matches bucket `file_size_limit` (after client compress). */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

/** Soft cap on the raw file the browser will try to process. */
export const AVATAR_SOURCE_MAX_BYTES = 25 * 1024 * 1024;

export function avatarObjectPath(userId: string, mimeType: string): string | null {
  const ext = AVATAR_MIME_TO_EXT[mimeType];
  if (!ext) return null;
  return `${userId}/avatar.${ext}`;
}

export function allAvatarObjectPaths(userId: string): string[] {
  return [...new Set(Object.values(AVATAR_MIME_TO_EXT))].map(
    (ext) => `${userId}/avatar.${ext}`,
  );
}

export function validateAvatarSourceFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Use a JPEG, PNG, WebP, or GIF image.";
  }
  if (file.size > AVATAR_SOURCE_MAX_BYTES) {
    return "Image is too large to process (max 25 MB).";
  }
  return null;
}

export function validateAvatarFile(file: File): string | null {
  const sourceError = validateAvatarSourceFile(file);
  if (sourceError) return sourceError;
  if (file.size > AVATAR_MAX_BYTES) {
    return "Image must be 2 MB or smaller.";
  }
  return null;
}

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
    return parsed.href.startsWith(
      `${base}/storage/v1/object/public/${AVATAR_BUCKET}/`,
    );
  } catch {
    return false;
  }
}

export function withAvatarCacheBust(publicUrl: string): string {
  const base = stripAvatarUrlCacheBust(publicUrl);
  return `${base}${base.includes("?") ? "&" : "?"}t=${Date.now()}`;
}
