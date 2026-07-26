"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { validateBannerSourceFile } from "@/lib/profile/banner-storage";
import {
  BANNER_PREPARE_OPTIONS,
  prepareImageForUpload,
} from "@/lib/profile/prepare-image-for-upload";
import { bodyMutedClass, formLabelClass, optionalHintClass } from "@/lib/ui/typography";

type Props = {
  imageUrl: string | null;
  disabled?: boolean;
  error?: string | null;
  onFileChange?: (file: File | null) => void;
  onClear?: () => void;
};

export function ProfileBannerUpload({
  imageUrl,
  disabled = false,
  error = null,
  onFileChange,
  onClear,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const displayUrl = cleared ? null : (localPreviewUrl ?? imageUrl);
  const displayError = pickError ?? error;
  const busy = disabled || preparing;

  const handlePick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleClear = useCallback(() => {
    setCleared(true);
    setPickError(null);
    setLocalPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    onFileChange?.(null);
    onClear?.();
  }, [onClear, onFileChange]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      const sourceError = validateBannerSourceFile(file);
      if (sourceError) {
        setPickError(sourceError);
        return;
      }

      setPreparing(true);
      setPickError(null);
      try {
        const prepared = await prepareImageForUpload(file, BANNER_PREPARE_OPTIONS);
        if (!prepared.ok) {
          setPickError(prepared.error);
          return;
        }

        setCleared(false);
        setLocalPreviewUrl((prev) => {
          if (prev?.startsWith("blob:")) {
            URL.revokeObjectURL(prev);
          }
          return URL.createObjectURL(prepared.file);
        });
        onFileChange?.(prepared.file);
      } finally {
        setPreparing(false);
      }
    },
    [onFileChange],
  );

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label htmlFor={inputId} className={formLabelClass}>
          Banner image <span className={optionalHintClass}>(optional)</span>
        </label>
        <p className={`${bodyMutedClass} text-xs`}>
          Wide image across the top of your profile. Large photos are cropped to
          the banner shape and compressed automatically.
        </p>
      </div>

      <div className="relative aspect-[1024/169] w-full overflow-hidden rounded-xl border border-editorial-border bg-stone-100 dark:bg-stone-900">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob or storage URL
          <img
            src={displayUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-200 via-stone-100 to-editorial-accent/25 dark:from-stone-800 dark:via-stone-900 dark:to-editorial-accent/20" />
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        disabled={busy}
        onChange={handleFileChange}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handlePick}
          disabled={busy}
          className="rounded-full border border-editorial-border bg-editorial-card px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-100/90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-stone-100 dark:hover:bg-stone-800/60"
        >
          {preparing
            ? "Preparing…"
            : displayUrl
              ? "Change banner"
              : "Choose banner"}
        </button>
        {displayUrl ? (
          <button
            type="button"
            onClick={handleClear}
            disabled={busy}
            className="rounded-full border border-editorial-border px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100/90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-stone-300 dark:hover:bg-stone-800/60"
          >
            Remove
          </button>
        ) : null}
      </div>
      {displayError ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300/90">
          {displayError}
        </p>
      ) : null}
    </div>
  );
}
