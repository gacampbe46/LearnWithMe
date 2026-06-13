"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ProfileAvatar } from "@/components/profile-avatar";
import { validateAvatarFile } from "@/lib/profile/avatar-storage";
import { bodyMutedClass, formLabelClass } from "@/lib/ui/typography";

type Props = {
  name: string;
  /** Stored or OAuth preview URL — shown until the user picks a new file. */
  imageUrl: string | null;
  size?: "md" | "lg";
  className?: string;
  disabled?: boolean;
  error?: string | null;
  onFileChange?: (file: File | null) => void;
};

export function ProfileAvatarUpload({
  name,
  imageUrl,
  size = "lg",
  className = "",
  disabled = false,
  error = null,
  onFileChange,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const displayUrl = localPreviewUrl ?? imageUrl;
  const displayError = pickError ?? error;

  const handlePick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      const validationError = validateAvatarFile(file);
      if (validationError) {
        setPickError(validationError);
        return;
      }

      setPickError(null);
      setLocalPreviewUrl((prev) => {
        if (prev?.startsWith("blob:")) {
          URL.revokeObjectURL(prev);
        }
        return URL.createObjectURL(file);
      });
      onFileChange?.(file);
    },
    [onFileChange],
  );

  return (
    <div className={`flex flex-col items-center gap-3 text-center ${className}`.trim()}>
      <ProfileAvatar
        name={name}
        imageUrl={displayUrl}
        size={size}
        className="ring-2 ring-stone-100 dark:ring-stone-800"
      />

      <div className="space-y-2">
        <label htmlFor={inputId} className={formLabelClass}>
          Profile picture
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={disabled}
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={handlePick}
          disabled={disabled}
          className="rounded-full border border-editorial-border bg-editorial-card px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-100/90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-stone-100 dark:hover:bg-stone-800/60"
        >
          {displayUrl ? "Change photo" : "Choose photo"}
        </button>
        <p className={`${bodyMutedClass} text-xs`}>
          JPEG, PNG, WebP, or GIF · max 2 MB · saved when you submit
        </p>
        {displayError ? (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300/90">
            {displayError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
