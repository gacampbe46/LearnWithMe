import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  AVATAR_BUCKET,
  allAvatarObjectPaths,
  avatarObjectPath,
  validateAvatarFile,
  withAvatarCacheBust,
} from "@/lib/profile/avatar-storage";

export type UploadAvatarResult =
  | { ok: true; publicUrl: string }
  | { ok: false; error: string };

export async function uploadAvatarFile(
  userId: string,
  file: File,
): Promise<UploadAvatarResult> {
  const validationError = validateAvatarFile(file);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const objectPath = avatarObjectPath(userId, file.type);
  if (!objectPath) {
    return { ok: false, error: "Unsupported image type." };
  }

  const supabase = createSupabaseBrowserClient();

  const stalePaths = allAvatarObjectPaths(userId).filter((path) => path !== objectPath);
  if (stalePaths.length > 0) {
    await supabase.storage.from(AVATAR_BUCKET).remove(stalePaths);
  }

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(objectPath, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(objectPath);
  return { ok: true, publicUrl: withAvatarCacheBust(data.publicUrl) };
}
