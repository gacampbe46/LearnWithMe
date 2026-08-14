"use client";

import { ProfileAvatar } from "@/components/profile-avatar";
import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AvatarProps = {
  displayName: string;
  editProfileHref: string;
  avatarUrl: string | null;
  active?: boolean;
};

const itemClass =
  "inline-flex size-10 items-center justify-center rounded-xl text-stone-500 transition hover:bg-stone-200/70 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-editorial-accent-muted dark:text-stone-400 dark:hover:bg-stone-800/70 dark:hover:text-stone-50 dark:focus-visible:outline-stone-500";

const itemActiveClass =
  "bg-stone-200/80 text-stone-900 dark:bg-stone-800 dark:text-stone-50";

export function HomeAccountMenu({
  displayName,
  editProfileHref,
  avatarUrl,
  active = false,
}: AvatarProps) {
  const label = editProfileHref === "/onboarding" ? "Finish profile" : "Update profile";

  return (
    <Link
      href={editProfileHref}
      title={label}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`${itemClass} ${active ? itemActiveClass : ""}`}
    >
      <ProfileAvatar
        name={displayName}
        imageUrl={avatarUrl}
        size="sm"
        className="shrink-0"
      />
    </Link>
  );
}

export function SignOutButton() {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.assign("/");
    } catch (e) {
      console.error(e);
      setSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      title="Sign out"
      aria-label="Sign out"
      disabled={signingOut}
      onClick={() => void handleSignOut()}
      className={`${itemClass} disabled:opacity-50`}
    >
      <SignOutIcon />
    </button>
  );
}

function SignOutIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
      <path d="M9 12h12" />
      <path d="m18 9 3 3-3 3" />
    </svg>
  );
}
