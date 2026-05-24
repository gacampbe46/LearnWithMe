"use client";

import { ShareIcon } from "@/components/icons/share-icon";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const btnClasses =
  "inline-flex shrink-0 items-center justify-center rounded-md p-1.5 text-zinc-600 transition hover:bg-zinc-100/80 hover:text-zinc-900 disabled:opacity-60 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-100";

const toastBaseClasses =
  "pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-zinc-200/90 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow-lg transition-opacity duration-300 ease-out motion-reduce:transition-none dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-950";

const TOAST_VISIBLE_MS = 2000;
const TOAST_FADE_MS = 300;

type ToastPhase = "hidden" | "shown" | "exiting";

type Props = {
  /** Path only, e.g. `/alice/program-id` — origin is added when sharing. */
  urlPath: string;
  /** Shown in native share sheet when supported. */
  title: string;
  ariaLabel?: string;
  /** Merged after default button styles (e.g. inverse colors on a primary pill). */
  className?: string;
};

export function ShareProgramButton({
  urlPath,
  title,
  ariaLabel = "Share program",
  className = "",
}: Props) {
  const [busy, setBusy] = useState(false);
  const [toastPhase, setToastPhase] = useState<ToastPhase>("hidden");
  const inFlightRef = useRef(false);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearToastTimers = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const showCopyToast = useCallback(() => {
    clearToastTimers();
    setToastPhase("shown");
    showTimeoutRef.current = setTimeout(() => {
      setToastPhase("exiting");
      showTimeoutRef.current = null;
      hideTimeoutRef.current = setTimeout(() => {
        setToastPhase("hidden");
        hideTimeoutRef.current = null;
      }, TOAST_FADE_MS);
    }, TOAST_VISIBLE_MS);
  }, [clearToastTimers]);

  const handleToastTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== "opacity" || toastPhase !== "exiting") return;
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      setToastPhase("hidden");
    },
    [toastPhase],
  );

  useEffect(() => {
    return () => {
      clearToastTimers();
    };
  }, [clearToastTimers]);

  const share = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setBusy(true);
    try {
      const path = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}${path}`
          : path;

      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text: title, url });
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        showCopyToast();
      }
    } catch {
      // User dismissed share sheet or clipboard denied — ignore.
    } finally {
      inFlightRef.current = false;
      setBusy(false);
    }
  }, [showCopyToast, title, urlPath]);

  const toastVisible = toastPhase !== "hidden";
  const label = toastVisible ? "Link copied" : ariaLabel;

  return (
    <>
      <button
        type="button"
        className={`${btnClasses} ${className}`.trim()}
        aria-label={label}
        title={toastVisible ? "Link copied" : ariaLabel}
        disabled={busy}
        onClick={() => void share()}
      >
        <ShareIcon />
      </button>
      {toastVisible && typeof document !== "undefined"
        ? createPortal(
            <div
              role="status"
              aria-live="polite"
              className={`${toastBaseClasses} ${
                toastPhase === "exiting" ? "opacity-0" : "opacity-100"
              }`}
              onTransitionEnd={handleToastTransitionEnd}
            >
              Link copied
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
