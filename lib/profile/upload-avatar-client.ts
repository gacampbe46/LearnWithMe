import {
  AVATAR_BUCKET,
  allAvatarObjectPaths,
  avatarObjectPath,
  validateAvatarFile,
  validateAvatarSourceFile,
  withAvatarCacheBust,
} from "@/lib/profile/avatar-storage";
import { AVATAR_PREPARE_OPTIONS } from "@/lib/profile/prepare-image-for-upload";
import {
  uploadPreparedProfileImage,
  type UploadProfileImageResult,
} from "@/lib/profile/upload-profile-image-client";

export type UploadAvatarResult = UploadProfileImageResult;

export function uploadAvatarFile(
  userId: string,
  file: File,
): Promise<UploadAvatarResult> {
  return uploadPreparedProfileImage({
    bucket: AVATAR_BUCKET,
    userId,
    file,
    prepare: AVATAR_PREPARE_OPTIONS,
    objectPath: avatarObjectPath,
    allPaths: allAvatarObjectPaths,
    validateSource: validateAvatarSourceFile,
    validatePrepared: validateAvatarFile,
    withCacheBust: withAvatarCacheBust,
  });
}
