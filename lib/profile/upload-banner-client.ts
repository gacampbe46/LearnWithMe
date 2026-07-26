import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  BANNER_BUCKET,
  allBannerObjectPaths,
  bannerObjectPath,
  validateBannerFile,
  validateBannerSourceFile,
  withBannerCacheBust,
} from "@/lib/profile/banner-storage";
import {
  BANNER_PREPARE_OPTIONS,
  prepareImageForUpload,
} from "@/lib/profile/prepare-image-for-upload";

export type UploadBannerResult =
  | { ok: true; publicUrl: string }
  | { ok: false; error: string };

export async function uploadBannerFile(
  userId: string,
  file: File,
): Promise<UploadBannerResult> {
  const sourceError = validateBannerSourceFile(file);
  if (sourceError) {
    return { ok: false, error: sourceError };
  }

  const prepared = await prepareImageForUpload(file, BANNER_PREPARE_OPTIONS);
  if (!prepared.ok) {
    return prepared;
  }

  const validationError = validateBannerFile(prepared.file);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const objectPath = bannerObjectPath(userId, prepared.file.type);
  if (!objectPath) {
    return { ok: false, error: "Unsupported image type." };
  }

  const supabase = createSupabaseBrowserClient();

  const stalePaths = allBannerObjectPaths(userId).filter((path) => path !== objectPath);
  if (stalePaths.length > 0) {
    await supabase.storage.from(BANNER_BUCKET).remove(stalePaths);
  }

  const { error: uploadError } = await supabase.storage
    .from(BANNER_BUCKET)
    .upload(objectPath, prepared.file, {
      upsert: true,
      contentType: prepared.file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const { data } = supabase.storage.from(BANNER_BUCKET).getPublicUrl(objectPath);
  return { ok: true, publicUrl: withBannerCacheBust(data.publicUrl) };
}
