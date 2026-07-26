import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PrepareImageOptions } from "@/lib/profile/prepare-image-for-upload";
import { prepareImageForUpload } from "@/lib/profile/prepare-image-for-upload";

type UploadImageConfig = {
  bucket: string;
  userId: string;
  file: File;
  prepare: PrepareImageOptions;
  objectPath: (userId: string, mimeType: string) => string | null;
  allPaths: (userId: string) => string[];
  validateSource: (file: File) => string | null;
  validatePrepared: (file: File) => string | null;
  withCacheBust: (url: string) => string;
};

export type UploadProfileImageResult =
  | { ok: true; publicUrl: string }
  | { ok: false; error: string };

export async function uploadPreparedProfileImage(
  config: UploadImageConfig,
): Promise<UploadProfileImageResult> {
  const sourceError = config.validateSource(config.file);
  if (sourceError) return { ok: false, error: sourceError };

  const prepared = await prepareImageForUpload(config.file, config.prepare);
  if (!prepared.ok) return prepared;

  const validationError = config.validatePrepared(prepared.file);
  if (validationError) return { ok: false, error: validationError };

  const objectPath = config.objectPath(config.userId, prepared.file.type);
  if (!objectPath) return { ok: false, error: "Unsupported image type." };

  const supabase = createSupabaseBrowserClient();
  const stale = config.allPaths(config.userId).filter((p) => p !== objectPath);
  if (stale.length > 0) {
    await supabase.storage.from(config.bucket).remove(stale);
  }

  const { error } = await supabase.storage
    .from(config.bucket)
    .upload(objectPath, prepared.file, {
      upsert: true,
      contentType: prepared.file.type,
      cacheControl: "3600",
    });

  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from(config.bucket).getPublicUrl(objectPath);
  return { ok: true, publicUrl: config.withCacheBust(data.publicUrl) };
}
