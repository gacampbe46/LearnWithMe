"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { parseGumletAssetId } from "@/lib/gumlet/asset-id";
import { uploadSessionVideo } from "@/lib/gumlet/upload-session-video";
import { VIDEO_ACCEPT } from "@/lib/gumlet/video-file";
import { sessionThumbnailShellClass } from "@/lib/ui/page-layout";
import { captionClass, formLabelClass } from "@/lib/ui/typography";

type Props = {
  programId: string;
  assetId: string;
  onAssetIdChange: (assetId: string) => void;
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
  /** True when this session already has a Gumlet video. */
  hasExisting?: boolean;
  /** Asset ID already saved on the session — never delete this until save replaces it. */
  committedAssetId?: string;
  existingThumbnailUrl?: string | null;
  inputName?: string;
};

export function SessionVideoUploadField({
  programId,
  assetId,
  onAssetIdChange,
  onBusyChange,
  disabled = false,
  hasExisting = false,
  committedAssetId = "",
  existingThumbnailUrl = null,
  inputName = "content_url",
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCount = useRef(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const uploading = progress != null && progress < 100;

  const validAssetId = parseGumletAssetId(assetId) ?? "";
  const savedAssetId = parseGumletAssetId(committedAssetId) ?? "";
  const busy = disabled || uploading;
  const canReplace = hasExisting || Boolean(validAssetId);
  const savedThumb =
    typeof existingThumbnailUrl === "string" &&
    existingThumbnailUrl.startsWith("https://")
      ? existingThumbnailUrl
      : null;
  const previewUrl = localPreviewUrl ?? savedThumb;

  useEffect(() => {
    return () => {
      if (localPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  async function discardUnsavedAsset(previousId: string) {
    if (!previousId || previousId === savedAssetId) return;
    try {
      await fetch("/api/gumlet/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId, assetId: previousId }),
      });
    } catch {
      // Best-effort cleanup; the new upload should still proceed.
    }
  }

  async function startUpload(file: File) {
    const previousId = validAssetId;
    setError(null);
    setFileName(file.name);
    setProgress(0);
    onBusyChange?.(true);
    setLocalPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    const result = await uploadSessionVideo(file, programId, setProgress);
    if (!result.ok) {
      setError(result.error);
      setProgress(null);
      setFileName(null);
      setLocalPreviewUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
      onBusyChange?.(false);
      return;
    }

    setProgress(100);
    onAssetIdChange(result.assetId);
    onBusyChange?.(false);
    void discardUnsavedAsset(previousId);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    void startUpload(file);
  }

  function handleDragEnter(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;
    dragCount.current += 1;
    setDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    dragCount.current -= 1;
    if (dragCount.current <= 0) {
      dragCount.current = 0;
      setDragging(false);
    }
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!busy) {
      event.dataTransfer.dropEffect = "copy";
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    dragCount.current = 0;
    setDragging(false);
    if (busy) return;
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    void startUpload(file);
  }

  const justAttached = Boolean(fileName && validAssetId);

  const statusLabel = (() => {
    if (uploading) {
      return `${progress ?? 0}% — keep this tab open until it finishes.`;
    }
    if (justAttached) {
      return "Save the session to keep this video. It may take a minute to become playable.";
    }
    if (previewUrl) {
      return "Click or drop to change this video. MP4, MOV, WebM, or M4V. Up to 2 GB.";
    }
    return "MP4, MOV, WebM, or M4V. Up to 2 GB.";
  })();

  const emptyPrompt = dragging
    ? "Drop to attach"
    : canReplace
      ? "Click or drop to add a video"
      : "Drop a video or click to browse";

  return (
    <div className="space-y-2">
      <span className={formLabelClass} id={`${inputId}-label`}>
        Video
      </span>
      <input type="hidden" name={inputName} value={validAssetId} />
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={VIDEO_ACCEPT}
        className="sr-only"
        disabled={busy}
        onChange={handleFileChange}
        aria-labelledby={`${inputId}-label`}
      />
      <label
        htmlFor={inputId}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        aria-label={previewUrl ? "Change video" : undefined}
        className={`${sessionThumbnailShellClass} flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 text-center transition ${
          previewUrl ? "border-solid" : "border-dashed"
        } ${busy ? "cursor-not-allowed opacity-80" : ""} ${
          dragging
            ? "border-editorial-accent"
            : "border-editorial-border bg-editorial-card hover:border-editorial-accent-muted"
        }`}
      >
        {localPreviewUrl ? (
          <video
            src={localPreviewUrl}
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
            onLoadedMetadata={(event) => {
              try {
                event.currentTarget.currentTime = 0.1;
              } catch {
                // Some files don't seek until more data is loaded.
              }
            }}
          />
        ) : savedThumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={savedThumb}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="relative z-10 max-w-[90%] px-3 text-sm font-medium text-stone-800 dark:text-stone-100">
            {emptyPrompt}
          </span>
        )}
        {uploading ? (
          <div
            className="absolute inset-x-0 bottom-0 z-10 h-1.5 bg-stone-200/80 dark:bg-stone-700/80"
            aria-hidden
          >
            <div
              className="h-full bg-editorial-accent transition-[width]"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
        ) : null}
      </label>
      <p className={captionClass}>{statusLabel}</p>
      {error ? (
        <p role="alert" className="text-sm text-red-800 dark:text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}
