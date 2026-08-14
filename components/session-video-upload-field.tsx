"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import { parseGumletAssetId } from "@/lib/gumlet/asset-id";
import { uploadSessionVideo } from "@/lib/gumlet/upload-session-video";
import { VIDEO_ACCEPT } from "@/lib/gumlet/video-file";
import {
  captionClass,
  formLabelClass,
} from "@/lib/ui/typography";

const fileBtnClass =
  "rounded-full border border-editorial-border bg-editorial-card px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-100/90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-stone-100 dark:hover:bg-stone-800/60";

type Props = {
  programId: string;
  assetId: string;
  onAssetIdChange: (assetId: string) => void;
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
  /** True when this session already has a Gumlet video. */
  hasExisting?: boolean;
  inputName?: string;
};

export function SessionVideoUploadField({
  programId,
  assetId,
  onAssetIdChange,
  onBusyChange,
  disabled = false,
  hasExisting = false,
  inputName = "content_url",
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploading = progress != null && progress < 100;

  const validAssetId = parseGumletAssetId(assetId) ?? "";
  const busy = disabled || uploading;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setFileName(file.name);
    setProgress(0);
    onBusyChange?.(true);

    const result = await uploadSessionVideo(file, programId, setProgress);
    if (!result.ok) {
      setError(result.error);
      setProgress(null);
      setFileName(null);
      onBusyChange?.(false);
      return;
    }

    setProgress(100);
    onAssetIdChange(result.assetId);
    onBusyChange?.(false);
  }

  const statusLabel = (() => {
    if (uploading) {
      return `Uploading… ${progress ?? 0}%`;
    }
    if (fileName && validAssetId) {
      return `${fileName} uploaded. It will finish processing shortly.`;
    }
    if (hasExisting && validAssetId) {
      return "Video uploaded. Choose a new file to replace it.";
    }
    return "MP4, MOV, WebM, or M4V. Up to 2 GB.";
  })();

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className={formLabelClass}>
        Video
      </label>
      <input type="hidden" name={inputName} value={validAssetId} />
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={VIDEO_ACCEPT}
        className="sr-only"
        disabled={busy}
        onChange={handleFileChange}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={fileBtnClass}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {uploading
            ? "Uploading…"
            : hasExisting || validAssetId
              ? "Replace video"
              : "Choose video"}
        </button>
        {uploading ? (
          <div
            className="h-2 w-32 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700"
            aria-hidden
          >
            <div
              className="h-full bg-editorial-accent transition-[width]"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
        ) : null}
      </div>
      <p className={captionClass}>{statusLabel}</p>
      {error ? (
        <p role="alert" className="text-sm text-red-800 dark:text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}
