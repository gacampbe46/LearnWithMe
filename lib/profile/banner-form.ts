import {
  isBannerStoragePublicUrl,
  stripBannerUrlCacheBust,
  withBannerCacheBust,
} from "@/lib/profile/banner-storage";

export type ParseBannerUrlResult =
  | { ok: true; bannerUrl: string | null }
  | { ok: false; error: string };

export function parseBannerUrlField(raw: string | null): ParseBannerUrlResult {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) {
    return { ok: true, bannerUrl: null };
  }

  if (!isBannerStoragePublicUrl(trimmed)) {
    return {
      ok: false,
      error: "Invalid banner image. Upload again and try once more.",
    };
  }

  const canonical = stripBannerUrlCacheBust(trimmed);
  return { ok: true, bannerUrl: withBannerCacheBust(canonical) };
}
