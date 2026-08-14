/** Client-side cap for session video uploads (bytes). */
export const VIDEO_MAX_BYTES = 2 * 1024 * 1024 * 1024;

export const VIDEO_ACCEPT =
  "video/mp4,video/quicktime,video/webm,video/x-m4v,.mp4,.mov,.webm,.m4v";

const ALLOWED_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
]);

const ALLOWED_EXTENSIONS = new Set(["mp4", "mov", "webm", "m4v"]);

function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  return name.slice(dot + 1).toLowerCase();
}

export function validateSessionVideoFile(file: File): string | null {
  if (file.size <= 0) {
    return "That file looks empty. Choose a video to upload.";
  }
  if (file.size > VIDEO_MAX_BYTES) {
    return "Videos must be 2 GB or smaller.";
  }

  const ext = fileExtension(file.name);
  const typeOk = file.type ? ALLOWED_TYPES.has(file.type) : false;
  const extOk = ALLOWED_EXTENSIONS.has(ext);
  if (!typeOk && !extOk) {
    return "Use an MP4, MOV, WebM, or M4V video.";
  }

  return null;
}

export function contentTypeForVideoFile(file: File): string {
  if (file.type && ALLOWED_TYPES.has(file.type)) return file.type;
  const ext = fileExtension(file.name);
  if (ext === "mov") return "video/quicktime";
  if (ext === "webm") return "video/webm";
  if (ext === "m4v") return "video/x-m4v";
  return "video/mp4";
}
