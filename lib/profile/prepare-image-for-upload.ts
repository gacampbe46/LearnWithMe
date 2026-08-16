import { AVATAR_MAX_BYTES } from "@/lib/profile/avatar-storage";

/** Crop anchor in 0–1 source coordinates, matching CSS `object-position`. */
export type CropFocus = { x: number; y: number };

export type PrepareImageOptions = {
  maxBytes: number;
  maxEdge: number;
  /** width / height — cropped before scale */
  aspectRatio: number;
  baseName: string;
  /** Where the crop window sits on the overflowing axis. Defaults to center. */
  focus?: CropFocus;
};

const CENTER_FOCUS: CropFocus = { x: 0.5, y: 0.5 };

export type PrepareImageResult =
  | { ok: true; file: File }
  | { ok: false; error: string };

const QUALITY_STEPS = [0.92, 0.85, 0.78, 0.7, 0.62, 0.55, 0.48];

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.min(1, Math.max(0, value));
}

function cropRect(
  width: number,
  height: number,
  aspectRatio: number,
  focus: CropFocus,
): { sx: number; sy: number; sw: number; sh: number } {
  const sourceRatio = width / height;
  if (sourceRatio > aspectRatio) {
    const sw = Math.round(height * aspectRatio);
    return {
      sx: Math.round((width - sw) * clamp01(focus.x)),
      sy: 0,
      sw,
      sh: height,
    };
  }
  const sh = Math.round(width / aspectRatio);
  return {
    sx: 0,
    sy: Math.round((height - sh) * clamp01(focus.y)),
    sw: width,
    sh,
  };
}

function fitMaxEdge(w: number, h: number, maxEdge: number) {
  const long = Math.max(w, h);
  if (long <= maxEdge) return { width: w, height: h };
  const scale = maxEdge / long;
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function encodeUnderLimit(
  source: HTMLCanvasElement,
  maxBytes: number,
  baseName: string,
): Promise<File | null> {
  let canvas = source;

  for (let shrink = 0; shrink < 7; shrink++) {
    if (shrink > 0) {
      const next = document.createElement("canvas");
      next.width = Math.max(1, Math.round(canvas.width * 0.82));
      next.height = Math.max(1, Math.round(canvas.height * 0.82));
      const ctx = next.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(canvas, 0, 0, next.width, next.height);
      canvas = next;
    }

    const formats =
      shrink === 0
        ? [
            { mime: "image/webp", ext: "webp" },
            { mime: "image/jpeg", ext: "jpg" },
          ]
        : [{ mime: "image/jpeg", ext: "jpg" }];

    for (const { mime, ext } of formats) {
      for (const quality of QUALITY_STEPS) {
        const blob = await toBlob(canvas, mime, quality);
        if (blob && blob.size <= maxBytes) {
          return new File([blob], `${baseName}.${ext}`, {
            type: mime,
            lastModified: Date.now(),
          });
        }
      }
    }
  }

  return null;
}

/**
 * Canvas processing flattens animation, so GIFs that already fit are uploaded
 * untouched — meaning they keep moving but skip cropping and resizing.
 */
export function willPassThroughUnchanged(
  file: File,
  options: PrepareImageOptions,
): boolean {
  return file.type === "image/gif" && file.size <= options.maxBytes;
}

/** Crop to `aspectRatio` around `focus`, scale, and compress under `maxBytes`. */
export async function prepareImageForUpload(
  file: File,
  options: PrepareImageOptions,
): Promise<PrepareImageResult> {
  const { maxBytes, maxEdge, aspectRatio, baseName } = options;

  if (willPassThroughUnchanged(file, options)) {
    return { ok: true, file };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { ok: false, error: "Couldn’t read that image. Try another file." };
  }

  try {
    const crop = cropRect(
      bitmap.width,
      bitmap.height,
      aspectRatio,
      options.focus ?? CENTER_FOCUS,
    );
    const size = fitMaxEdge(crop.sw, crop.sh, maxEdge);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { ok: false, error: "Couldn’t process that image in this browser." };
    }

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

export const AVATAR_PREPARE_OPTIONS: PrepareImageOptions = {
  maxBytes: AVATAR_MAX_BYTES,
  maxEdge: 1280,
  aspectRatio: 1,
  baseName: "avatar",
};

export const BANNER_PREPARE_OPTIONS: PrepareImageOptions = {
  maxBytes: AVATAR_MAX_BYTES,
  maxEdge: 2048,
  aspectRatio: 1024 / 169,
  baseName: "banner",
};
