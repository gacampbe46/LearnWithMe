import {
  contentTypeForVideoFile,
  validateSessionVideoFile,
} from "@/lib/gumlet/video-file";
import { parseGumletAssetId } from "@/lib/gumlet/asset-id";

type UploadOk = { ok: true; assetId: string };
type UploadFail = { ok: false; error: string };
export type UploadSessionVideoResult = UploadOk | UploadFail;

type DirectUploadResponse =
  | { assetId: string; uploadUrl: string }
  | { error: string };

function putFileWithProgress(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable || event.total <= 0) return;
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      reject(new Error(`Upload failed (${xhr.status}). Try again.`));
    };

    xhr.onerror = () => {
      reject(new Error("Upload failed. Check your connection and try again."));
    };

    xhr.onabort = () => {
      reject(new Error("Upload was cancelled."));
    };

    xhr.send(file);
  });
}

export async function uploadSessionVideo(
  file: File,
  programId: string,
  onProgress?: (percent: number) => void,
): Promise<UploadSessionVideoResult> {
  const validationError = validateSessionVideoFile(file);
  if (validationError) return { ok: false, error: validationError };

  const contentType = contentTypeForVideoFile(file);

  let signed: DirectUploadResponse;
  try {
    const response = await fetch("/api/gumlet/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        programId,
        title: file.name.replace(/\.[^.]+$/, "").slice(0, 280),
        contentType,
      }),
    });
    signed = (await response.json()) as DirectUploadResponse;
    if (!response.ok) {
      const message =
        "error" in signed && typeof signed.error === "string"
          ? signed.error
          : "Could not start the video upload.";
      return { ok: false, error: message };
    }
  } catch {
    return { ok: false, error: "Could not start the video upload." };
  }

  if (!("assetId" in signed) || !("uploadUrl" in signed)) {
    return { ok: false, error: "Could not start the video upload." };
  }

  const assetId = parseGumletAssetId(signed.assetId);
  if (!assetId || !signed.uploadUrl.startsWith("https://")) {
    return { ok: false, error: "Could not start the video upload." };
  }

  try {
    await putFileWithProgress(signed.uploadUrl, file, contentType, onProgress);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed. Try again.";
    return { ok: false, error: message };
  }

  return { ok: true, assetId };
}
