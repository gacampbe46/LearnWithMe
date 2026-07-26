import {
  AVATAR_BUCKET,
  AVATAR_MIME_TO_EXT,
  stripAvatarUrlCacheBust,
  validateAvatarFile,
  validateAvatarSourceFile,
  withAvatarCacheBust,
} from "@/lib/profile/avatar-storage";

export const BANNER_BUCKET = AVATAR_BUCKET;

export {
  validateAvatarSourceFile as validateBannerSourceFile,
  validateAvatarFile as validateBannerFile,
  stripAvatarUrlCacheBust as stripBannerUrlCacheBust,
  withAvatarCacheBust as withBannerCacheBust,
};

export function bannerObjectPath(userId: string, mimeType: string): string | null {
  const ext = AVATAR_MIME_TO_EXT[mimeType];
  if (!ext) return null;
  return `${userId}/banner.${ext}`;
}

export function allBannerObjectPaths(userId: string): string[] {
  return [...new Set(Object.values(AVATAR_MIME_TO_EXT))].map(
    (ext) => `${userId}/banner.${ext}`,
  );
}

export function isBannerStoragePublicUrl(url: string): boolean {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return false;
  try {
    const parsed = new URL(stripAvatarUrlCacheBust(url));
    if (
      !parsed.href.startsWith(`${base}/storage/v1/object/public/${AVATAR_BUCKET}/`)
    ) {
      return false;
    }
    return /\/banner\.(jpg|png|webp|gif)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}
