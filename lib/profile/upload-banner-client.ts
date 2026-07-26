import {
  BANNER_BUCKET,
  allBannerObjectPaths,
  bannerObjectPath,
  validateBannerFile,
  validateBannerSourceFile,
  withBannerCacheBust,
} from "@/lib/profile/banner-storage";
import { BANNER_PREPARE_OPTIONS } from "@/lib/profile/prepare-image-for-upload";
import {
  uploadPreparedProfileImage,
  type UploadProfileImageResult,
} from "@/lib/profile/upload-profile-image-client";

export type UploadBannerResult = UploadProfileImageResult;

export function uploadBannerFile(
  userId: string,
  file: File,
): Promise<UploadBannerResult> {
  return uploadPreparedProfileImage({
    bucket: BANNER_BUCKET,
    userId,
    file,
    prepare: BANNER_PREPARE_OPTIONS,
    objectPath: bannerObjectPath,
    allPaths: allBannerObjectPaths,
    validateSource: validateBannerSourceFile,
    validatePrepared: validateBannerFile,
    withCacheBust: withBannerCacheBust,
  });
}
