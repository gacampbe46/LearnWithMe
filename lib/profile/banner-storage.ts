import {
  AVATAR_BUCKET,
  AVATAR_MAX_BYTES,
  validateAvatarFile,
  validateAvatarSourceFile,
} from "@/lib/profile/avatar-storage";

export {
  AVATAR_BUCKET as BANNER_BUCKET,
  AVATAR_MAX_BYTES as BANNER_MAX_BYTES,
  AVATAR_SOURCE_MAX_BYTES as BANNER_SOURCE_MAX_BYTES,
};

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Banner object path in the shared avatars bucket. */
export function bannerObjectPath(userId: string, mimeType: string): string | null {
  const ext = MIME_TO_EXT[mimeType];
  if (!ext) return null;
  return `${userId}/banner.${ext}`;
}

export function allBannerObjectPaths(userId: string): string[] {
  return [...new Set(Object.values(MIME_TO_EXT))].map(
    (ext) => `${userId}/banner.${ext}`,
  );
}

export function validateBannerSourceFile(file: File): string | null {
  return validateAvatarSourceFile(file);
}

export function validateBannerFile(file: File): string | null {
  return validateAvatarFile(file);
}

/** Strip cache-bust query params before comparing or storing a canonical path. */
export function stripBannerUrlCacheBust(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("t");
    parsed.searchParams.delete("v");
    return parsed.toString();
  } catch {
    return url.split("?")[0] ?? url;
  }
}

export function isBannerStoragePublicUrl(url: string): boolean {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return false;

  try {
    const parsed = new URL(stripBannerUrlCacheBust(url));
    const expectedPrefix = `${base}/storage/v1/object/public/${AVATAR_BUCKET}/`;
    if (!parsed.href.startsWith(expectedPrefix)) return false;
    const path = parsed.pathname;
    return /\/banner\.(jpg|png|webp|gif)$/i.test(path);
  } catch {
    return false;
  }
}

export function withBannerCacheBust(publicUrl: string): string {
  const base = stripBannerUrlCacheBust(publicUrl);
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}t=${Date.now()}`;
}
