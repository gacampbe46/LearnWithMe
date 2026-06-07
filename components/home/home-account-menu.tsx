"use client";

import { ProfileAvatar } from "@/components/profile-avatar";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  displayName: string;
  profilePath: string | null;
  teachNewProgramHref: string | null;
  avatarUrl: string | null;
};

const triggerBase =
  "inline-flex min-h-10 max-w-[min(100vw-8rem,15rem)] items-center gap-1.5 rounded-full border border-stone-800 bg-editorial-card/50 px-5 text-sm font-medium text-stone-900 transition hover:border-editorial-accent-muted hover:bg-stone-900/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-editorial-accent-muted dark:border-stone-300 dark:bg-editorial-card/40 dark:text-stone-100 dark:hover:border-editorial-accent dark:hover:bg-stone-800/40 dark:focus-visible:outline-stone-500";

const menuItem =
  "flex w-full items-center px-4 py-2.5 text-left text-sm text-stone-800 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800/80";

export function HomeAccountMenu({
  displayName,
  profilePath,
  teachNewProgramHref,
  avatarUrl,
}: Props) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function onDocMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        close();
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      close();
      window.location.assign("/");
    } catch (e) {
      console.error(e);
      setSigningOut(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        className={`${triggerBase} truncate`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        title={
          profilePath
            ? displayName
            : `${displayName} — profile coming soon`
        }
      >
        <ProfileAvatar
          name={displayName}
          imageUrl={avatarUrl}
          size="sm"
          className="shrink-0"
        />
        <span className="truncate">{displayName}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-[60] min-w-[11rem] overflow-hidden rounded-xl border border-editorial-border bg-editorial-card py-1 shadow-lg dark:shadow-black/30"
        >
          {profilePath ? (
            <Link
              href={profilePath}
              role="menuitem"
              className={menuItem}
              onClick={close}
            >
              Your page
            </Link>
          ) : null}
          {teachNewProgramHref ? (
            <Link
              href={teachNewProgramHref}
              role="menuitem"
              className={menuItem}
              onClick={close}
            >
              New program
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className={`${menuItem} disabled:opacity-50`}
            disabled={signingOut}
            onClick={() => void handleSignOut()}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      className={`h-4 w-4 shrink-0 text-stone-500 transition dark:text-stone-400 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
