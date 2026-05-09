"use client";

import { ShareIcon } from "@/components/icons/share-icon";
import { useCallback, useRef, useState } from "react";

const btnClasses =
  "inline-flex shrink-0 items-center justify-center rounded-md p-1.5 text-zinc-600 transition hover:bg-zinc-100/80 hover:text-zinc-900 disabled:opacity-60 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-100";

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
  const [copied, setCopied] = useState(false);
  const inFlightRef = useRef(false);

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
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User dismissed share sheet or clipboard denied — ignore.
    } finally {
      inFlightRef.current = false;
      setBusy(false);
    }
  }, [title, urlPath]);

  const label = copied ? "Link copied" : ariaLabel;

  return (
    <button
      type="button"
      className={`${btnClasses} ${className}`.trim()}
      aria-label={label}
      title={copied ? "Link copied" : ariaLabel}
      disabled={busy}
      onClick={() => void share()}
    >
      <ShareIcon />
    </button>
  );
}
