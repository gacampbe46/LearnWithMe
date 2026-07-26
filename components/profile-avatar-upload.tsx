"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ProfileAvatar } from "@/components/profile-avatar";
import { validateAvatarSourceFile } from "@/lib/profile/avatar-storage";
import {
  AVATAR_PREPARE_OPTIONS,
  prepareImageForUpload,
} from "@/lib/profile/prepare-image-for-upload";
import { bodyMutedClass, formLabelClass } from "@/lib/ui/typography";

type Props = {
  name: string;
  imageUrl: string | null;
  size?: "md" | "lg";
  className?: string;
  disabled?: boolean;
  error?: string | null;
  onFileChange?: (file: File | null) => void;
};

const fileBtnClass =
  "rounded-full border border-editorial-border bg-editorial-card px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-100/90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-stone-100 dark:hover:bg-stone-800/60";

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
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const displayUrl = localPreviewUrl ?? imageUrl;
  const busy = disabled || preparing;

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      const sourceError = validateAvatarSourceFile(file);
      if (sourceError) {
        setPickError(sourceError);
        return;
      }

      setPreparing(true);
      setPickError(null);
      try {
        const prepared = await prepareImageForUpload(file, AVATAR_PREPARE_OPTIONS);
        if (!prepared.ok) {
          setPickError(prepared.error);
          return;
        }
        setLocalPreviewUrl((prev) => {
          if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
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
          disabled={busy}
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={fileBtnClass}
        >
          {preparing ? "Preparing…" : displayUrl ? "Change photo" : "Choose photo"}
        </button>
        <p className={`${bodyMutedClass} text-xs`}>
          JPEG, PNG, WebP, or GIF · large photos are cropped and compressed
          automatically
        </p>
        {(pickError ?? error) ? (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300/90">
            {pickError ?? error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
