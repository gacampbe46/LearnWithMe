import { Button } from "@/components/Button";
import type { MemberProfile } from "@/data/member";
import { getProfileHubLinks } from "@/lib/profileHubLinks";
import Link from "next/link";

type Props = {
  member: MemberProfile;
};

export function MemberProfileLinkHub({ member }: Props) {
  const links = getProfileHubLinks(member);
  const initial = member.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-12">
        <nav className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100"
          >
            ← Home
          </Link>
        </nav>

        <div className="flex flex-1 flex-col items-center text-center">
          <div
            className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-zinc-200 text-3xl font-semibold text-zinc-700 ring-4 ring-background dark:bg-zinc-800 dark:text-zinc-200"
            aria-hidden
          >
            {initial}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {member.name}
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {member.tagline}
          </p>

          <ul className="mt-10 flex w-full max-w-sm flex-col gap-3">
            {links.map((link) => (
              <li key={`${link.label}-${link.href}`} className="w-full">
                {link.external ? (
                  <Button
                    href={link.href}
                    className="w-full min-h-12 shadow-sm"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {link.label}
                  </Button>
                ) : (
                  <Button href={link.href} className="w-full min-h-12 shadow-sm">
                    {link.label}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
