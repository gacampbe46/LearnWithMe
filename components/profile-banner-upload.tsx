"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { validateBannerSourceFile } from "@/lib/profile/banner-storage";
import {
  BANNER_PREPARE_OPTIONS,
  prepareImageForUpload,
  willPassThroughUnchanged,
  type CropFocus,
} from "@/lib/profile/prepare-image-for-upload";
import { bodyMutedClass, formLabelClass, optionalHintClass } from "@/lib/ui/typography";

type Props = {
  imageUrl: string | null;
  disabled?: boolean;
  error?: string | null;
  onFileChange?: (file: File | null) => void;
  onClear?: () => void;
};

/** A file chosen this session, kept so the crop can be redone as focus moves. */
type PickedSource = {
  file: File;
  url: string;
  width: number;
  height: number;
};

const fileBtnClass =
  "rounded-full border border-editorial-border bg-editorial-card px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-100/90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-stone-100 dark:hover:bg-stone-800/60";

const removeBtnClass =
  "rounded-full border border-editorial-border px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100/90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-stone-300 dark:hover:bg-stone-800/60";

const CENTER_FOCUS: CropFocus = { x: 0.5, y: 0.5 };

/** Sources within this fraction of the banner shape lose nothing worth moving. */
const ASPECT_TOLERANCE = 0.01;

const ARROW_STEP = 0.02;

/** Re-encoding is expensive, so settle the gesture before cropping again. */
const COMMIT_DELAY_MS = 180;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function readImageSize(
  url: string,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const probe = new Image();
    probe.onload = () =>
      resolve({ width: probe.naturalWidth, height: probe.naturalHeight });
    probe.onerror = () => resolve(null);
    probe.src = url;
  });
}

export function ProfileBannerUpload({
  imageUrl,
  disabled = false,
  error = null,
  onFileChange,
  onClear,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragCount = useRef(0);
  const gestureStart = useRef<{
    pointerX: number;
    pointerY: number;
    focus: CropFocus;
  } | null>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commitSeq = useRef(0);

  const [source, setSource] = useState<PickedSource | null>(null);
  const [focus, setFocus] = useState<CropFocus>(CENTER_FOCUS);
  const [pickError, setPickError] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [fileDragging, setFileDragging] = useState(false);
  const [repositioning, setRepositioning] = useState(false);

  useEffect(() => {
    const url = source?.url;
    return () => {
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    };
  }, [source]);

  useEffect(() => {
    return () => {
      if (commitTimer.current) clearTimeout(commitTimer.current);
    };
  }, []);

  const displayUrl = cleared ? null : (source?.url ?? imageUrl);
  const busy = disabled || preparing;

  const sourceAspect = source ? source.width / source.height : null;
  const canReposition =
    source != null &&
    sourceAspect != null &&
    !willPassThroughUnchanged(source.file, BANNER_PREPARE_OPTIONS) &&
    Math.abs(sourceAspect / BANNER_PREPARE_OPTIONS.aspectRatio - 1) >
      ASPECT_TOLERANCE;

  /** Pixels of the scaled source hidden by the frame, per axis. */
  const hiddenExtent = useCallback(() => {
    const frame = frameRef.current;
    if (!frame || !source) return { x: 0, y: 0 };
    const rect = frame.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
    const scale = Math.max(
      rect.width / source.width,
      rect.height / source.height,
    );
    return {
      x: Math.max(0, source.width * scale - rect.width),
      y: Math.max(0, source.height * scale - rect.height),
    };
  }, [source]);

  const commitCrop = useCallback(
    async (nextFocus: CropFocus, picked: PickedSource) => {
      const seq = ++commitSeq.current;
      setPreparing(true);
      try {
        const prepared = await prepareImageForUpload(picked.file, {
          ...BANNER_PREPARE_OPTIONS,
          focus: nextFocus,
        });
        if (seq !== commitSeq.current) return;
        if (!prepared.ok) {
          setPickError(prepared.error);
          onFileChange?.(null);
          return;
        }
        setPickError(null);
        onFileChange?.(prepared.file);
      } finally {
        if (seq === commitSeq.current) setPreparing(false);
      }
    },
    [onFileChange],
  );

  const scheduleCommit = useCallback(
    (nextFocus: CropFocus) => {
      if (!source) return;
      const picked = source;
      if (commitTimer.current) clearTimeout(commitTimer.current);
      commitTimer.current = setTimeout(() => {
        void commitCrop(nextFocus, picked);
      }, COMMIT_DELAY_MS);
    },
    [commitCrop, source],
  );

  const handleClear = useCallback(() => {
    commitSeq.current += 1;
    if (commitTimer.current) clearTimeout(commitTimer.current);
    setPreparing(false);
    setCleared(true);
    setPickError(null);
    setFocus(CENTER_FOCUS);
    setSource(null);
    onFileChange?.(null);
    onClear?.();
  }, [onClear, onFileChange]);

  const acceptFile = useCallback(
    async (file: File) => {
      const sourceError = validateBannerSourceFile(file);
      if (sourceError) {
        setPickError(sourceError);
        return;
      }

      const url = URL.createObjectURL(file);
      const size = await readImageSize(url);
      if (!size) {
        URL.revokeObjectURL(url);
        setPickError("Couldn’t read that image. Try another file.");
        return;
      }

      const picked: PickedSource = { file, url, ...size };
      setCleared(false);
      setPickError(null);
      setFocus(CENTER_FOCUS);
      setSource(picked);
      await commitCrop(CENTER_FOCUS, picked);
    },
    [commitCrop],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      void acceptFile(file);
    },
    [acceptFile],
  );

  const handleDragEnter = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (busy) return;
      dragCount.current += 1;
      setFileDragging(true);
    },
    [busy],
  );

  const handleDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCount.current -= 1;
    if (dragCount.current <= 0) {
      dragCount.current = 0;
      setFileDragging(false);
    }
  }, []);

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!busy) event.dataTransfer.dropEffect = "copy";
    },
    [busy],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      dragCount.current = 0;
      setFileDragging(false);
      if (busy) return;
      const file = event.dataTransfer.files?.[0];
      if (!file) return;
      void acceptFile(file);
    },
    [acceptFile, busy],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!canReposition || busy) return;
      const hidden = hiddenExtent();
      if (hidden.x <= 0 && hidden.y <= 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      gestureStart.current = {
        pointerX: event.clientX,
        pointerY: event.clientY,
        focus,
      };
      setRepositioning(true);
    },
    [busy, canReposition, focus, hiddenExtent],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const start = gestureStart.current;
      if (!start) return;
      const hidden = hiddenExtent();
      setFocus({
        x:
          hidden.x > 0
            ? clamp01(
                start.focus.x - (event.clientX - start.pointerX) / hidden.x,
              )
            : start.focus.x,
        y:
          hidden.y > 0
            ? clamp01(
                start.focus.y - (event.clientY - start.pointerY) / hidden.y,
              )
            : start.focus.y,
      });
    },
    [hiddenExtent],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!gestureStart.current) return;
      gestureStart.current = null;
      setRepositioning(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      scheduleCommit(focus);
    },
    [focus, scheduleCommit],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!canReposition || busy) return;
      const step: Record<string, CropFocus> = {
        ArrowLeft: { x: -ARROW_STEP, y: 0 },
        ArrowRight: { x: ARROW_STEP, y: 0 },
        ArrowUp: { x: 0, y: -ARROW_STEP },
        ArrowDown: { x: 0, y: ARROW_STEP },
      };
      const delta = step[event.key];
      if (!delta) return;
      event.preventDefault();
      const hidden = hiddenExtent();
      const next = {
        x: hidden.x > 0 ? clamp01(focus.x + delta.x) : focus.x,
        y: hidden.y > 0 ? clamp01(focus.y + delta.y) : focus.y,
      };
      setFocus(next);
      scheduleCommit(next);
    },
    [busy, canReposition, focus, hiddenExtent, scheduleCommit],
  );

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label htmlFor={inputId} className={formLabelClass}>
          Banner image <span className={optionalHintClass}>(optional)</span>
        </label>
        <p className={`${bodyMutedClass} text-xs`}>
          Wide image across the top of your profile. Large photos are cropped and
          compressed automatically.
        </p>
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

      {displayUrl ? (
        <>
          <div
            ref={frameRef}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={handleKeyDown}
            tabIndex={canReposition ? 0 : undefined}
            aria-label={
              canReposition
                ? "Banner crop position — drag or use the arrow keys to choose which part shows"
                : undefined
            }
            className={`relative aspect-[1024/169] w-full overflow-hidden rounded-xl border bg-stone-100 dark:bg-stone-900 ${
              fileDragging
                ? "border-editorial-accent"
                : "border-editorial-border"
            } ${
              canReposition
                ? "touch-none select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-editorial-accent-muted"
                : ""
            } ${
              canReposition && !busy
                ? repositioning
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob or storage URL */}
            <img
              src={displayUrl}
              alt=""
              draggable={false}
              style={
                source
                  ? {
                      objectPosition: `${focus.x * 100}% ${focus.y * 100}%`,
                    }
                  : undefined
              }
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
          {canReposition ? (
            <p className={`${bodyMutedClass} text-xs`}>
              Drag the image to choose which part shows.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className={fileBtnClass}
            >
              {preparing ? "Preparing…" : "Change banner"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={busy}
              className={removeBtnClass}
            >
              Remove
            </button>
          </div>
        </>
      ) : (
        <label
          htmlFor={inputId}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-4 text-center text-sm font-medium transition ${
            busy ? "cursor-not-allowed opacity-70" : ""
          } ${
            fileDragging
              ? "border-editorial-accent bg-editorial-accent/10"
              : "border-editorial-border bg-editorial-card hover:border-editorial-accent-muted"
          }`}
        >
          <span className="text-stone-800 dark:text-stone-100">
            {preparing
              ? "Preparing…"
              : fileDragging
                ? "Drop to upload"
                : "Drop an image or click to upload"}
          </span>
          <span className={`${bodyMutedClass} text-xs font-normal`}>
            JPG, PNG, or WebP
          </span>
        </label>
      )}
      {(pickError ?? error) ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300/90">
          {pickError ?? error}
        </p>
      ) : null}
    </div>
  );
}
