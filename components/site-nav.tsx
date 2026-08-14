"use client";

import { HomeAccountMenu, SignOutButton } from "@/components/home/home-account-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import type { NavAccount } from "@/lib/auth/nav-account";
import Link from "next/link";
import { usePathname } from "next/navigation";

const itemClass =
  "flex size-10 items-center justify-center rounded-xl text-stone-500 transition hover:bg-stone-200/70 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-editorial-accent-muted dark:text-stone-400 dark:hover:bg-stone-800/70 dark:hover:text-stone-50 dark:focus-visible:outline-stone-500";

const itemActiveClass =
  "bg-stone-200/80 text-stone-900 dark:bg-stone-800 dark:text-stone-50";

type Props = {
  account: NavAccount | null | undefined;
};

export function SiteNavChrome({ account }: Props) {
  const pathname = usePathname() ?? "";
  const profilePath = account?.profilePath ?? null;
  const newProgramHref = account?.teachNewProgramHref ?? null;
  const editProfileHref = profilePath
    ? `${profilePath}/edit`
    : account
      ? "/onboarding"
      : null;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-16 flex-col items-center border-r border-editorial-border bg-background/80 py-3 backdrop-blur-xl">
      {account === undefined ? (
        <span
          className="size-10 animate-pulse rounded-xl bg-stone-200/90 dark:bg-stone-800"
          aria-hidden
        />
      ) : account && editProfileHref ? (
        <HomeAccountMenu
          displayName={account.displayName}
          editProfileHref={editProfileHref}
          avatarUrl={account.avatarUrl}
          active={
            pathname === editProfileHref || pathname.startsWith("/onboarding")
          }
        />
      ) : (
        <Link href="/login" title="Sign in" aria-label="Sign in" className={itemClass}>
          <SignInIcon />
        </Link>
      )}

      <nav className="mt-6 flex flex-col items-center gap-1" aria-label="Site">
        <NavIcon href="/" label="Explore" active={pathname === "/"}>
          <ExploreIcon />
        </NavIcon>
        {account && !profilePath ? (
          <NavIcon
            href="/onboarding"
            label="Finish profile"
            active={pathname.startsWith("/onboarding")}
          >
            <UserIcon />
          </NavIcon>
        ) : profilePath ? (
          <NavIcon
            href={profilePath}
            label="Your page"
            active={pathname === profilePath}
          >
            <UserIcon />
          </NavIcon>
        ) : null}
        {newProgramHref ? (
          <NavIcon
            href={newProgramHref}
            label="New program"
            active={pathname.startsWith("/teach/")}
          >
            <PlusIcon />
          </NavIcon>
        ) : null}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-1 pb-1">
        <ThemeToggle />
        {account ? <SignOutButton /> : null}
      </div>
    </aside>
  );
}

function NavIcon({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`${itemClass} ${active ? itemActiveClass : ""}`}
    >
      {children}
    </Link>
  );
}

function ExploreIcon() {
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
      <circle cx="11" cy="11" r="6.25" />
      <path d="m16 16 4.25 4.25" />
    </svg>
  );
}

function UserIcon() {
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
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function PlusIcon() {
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SignInIcon() {
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
      <path d="M10 17H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4" />
      <path d="M15 7l5 5-5 5" />
      <path d="M20 12H11" />
    </svg>
  );
}
