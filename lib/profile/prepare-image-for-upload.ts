/** Client-side resize / center-crop / compress for Supabase storage limits. */

export type PrepareImageOptions = {
  maxBytes: number;
  /** Longest edge after crop (px). */
  maxEdge: number;
  /** Target width / height. Center-cropped before scale. */
  aspectRatio: number;
  /** Output basename without extension, e.g. `avatar`. */
  baseName: string;
};

export type PrepareImageResult =
  | { ok: true; file: File }
  | { ok: false; error: string };

const QUALITY_STEPS = [0.92, 0.85, 0.78, 0.7, 0.62, 0.55, 0.48];

function loadImageBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

function centerCropSource(
  width: number,
  height: number,
  aspectRatio: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const sourceRatio = width / height;
  if (sourceRatio > aspectRatio) {
    const sw = Math.round(height * aspectRatio);
    return { sx: Math.round((width - sw) / 2), sy: 0, sw, sh: height };
  }
  const sh = Math.round(width / aspectRatio);
  return { sx: 0, sy: Math.round((height - sh) / 2), sw: width, sh };
}

function targetSize(
  cropW: number,
  cropH: number,
  maxEdge: number,
): { width: number; height: number } {
  const long = Math.max(cropW, cropH);
  if (long <= maxEdge) {
    return { width: cropW, height: cropH };
  }
  const scale = maxEdge / long;
  return {
    width: Math.max(1, Math.round(cropW * scale)),
    height: Math.max(1, Math.round(cropH * scale)),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function encodeUnderLimit(
  canvas: HTMLCanvasElement,
  maxBytes: number,
  baseName: string,
): Promise<File | null> {
  const types: Array<{ mime: string; ext: string }> = [
    { mime: "image/webp", ext: "webp" },
    { mime: "image/jpeg", ext: "jpg" },
  ];

  for (const { mime, ext } of types) {
    for (const quality of QUALITY_STEPS) {
      const blob = await canvasToBlob(canvas, mime, quality);
      if (!blob) continue;
      if (blob.size <= maxBytes) {
        return new File([blob], `${baseName}.${ext}`, {
          type: mime,
          lastModified: Date.now(),
        });
      }
    }
  }

  // Still too large — shrink canvas and retry JPEG.
  let width = canvas.width;
  let height = canvas.height;
  for (let attempt = 0; attempt < 6; attempt++) {
    width = Math.max(1, Math.round(width * 0.82));
    height = Math.max(1, Math.round(height * 0.82));
    const shrink = document.createElement("canvas");
    shrink.width = width;
    shrink.height = height;
    const ctx = shrink.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(canvas, 0, 0, width, height);

    for (const quality of QUALITY_STEPS) {
      const blob = await canvasToBlob(shrink, "image/jpeg", quality);
      if (!blob) continue;
      if (blob.size <= maxBytes) {
        return new File([blob], `${baseName}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
      }
    }
  }

  return null;
}

/**
 * Center-crops to `aspectRatio`, scales to `maxEdge`, and compresses under `maxBytes`.
 * Small GIFs under the limit pass through unchanged (keeps animation).
 */
export async function prepareImageForUpload(
  file: File,
  options: PrepareImageOptions,
): Promise<PrepareImageResult> {
  const { maxBytes, maxEdge, aspectRatio, baseName } = options;

  if (file.type === "image/gif" && file.size <= maxBytes) {
    return { ok: true, file };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await loadImageBitmap(file);
  } catch {
    return { ok: false, error: "Couldn’t read that image. Try another file." };
  }

  try {
    const crop = centerCropSource(bitmap.width, bitmap.height, aspectRatio);
    const size = targetSize(crop.sw, crop.sh, maxEdge);

    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { ok: false, error: "Couldn’t process that image in this browser." };
    }

    // Opaque backdrop so JPEG doesn’t get black transparency holes from PNG.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.drawImage(
      bitmap,
      crop.sx,
      crop.sy,
      crop.sw,
      crop.sh,
      0,
      0,
      size.width,
      size.height,
    );

    const prepared = await encodeUnderLimit(canvas, maxBytes, baseName);
    if (!prepared) {
      return {
        ok: false,
        error: "Couldn’t compress that image under 2 MB. Try a simpler photo.",
      };
    }
    return { ok: true, file: prepared };
  } finally {
    bitmap.close();
  }
}

/** Avatar: 1∶1 circle crop, long edge ≤ 1280. */
export const AVATAR_PREPARE_OPTIONS: PrepareImageOptions = {
  maxBytes: 2 * 1024 * 1024,
  maxEdge: 1280,
  aspectRatio: 1,
  baseName: "avatar",
};

/** Banner: ~1024∶169 strip, long edge ≤ 2048. */
export const BANNER_PREPARE_OPTIONS: PrepareImageOptions = {
  maxBytes: 2 * 1024 * 1024,
  maxEdge: 2048,
  aspectRatio: 1024 / 169,
  baseName: "banner",
};
