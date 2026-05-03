import { Button } from "@/components/Button";
import { ProfileAvatar } from "@/components/profile-avatar";
import type { MemberProfile } from "@/data/member";
import { getProfileHubLinks } from "@/lib/profileHubLinks";
import { profilePageHref } from "@/lib/profileLayoutQuery";
import Link from "next/link";

type Props = {
  member: MemberProfile;
  hasLayoutQuery?: boolean;
};

export function MemberProfileLinkHub({
  member,
  hasLayoutQuery = false,
}: Props) {
  const links = getProfileHubLinks(member);

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
          <ProfileAvatar
            name={member.name}
            size="lg"
            className="mb-6 ring-4 ring-background"
          />
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

          <div className="mt-12 max-w-sm text-center text-sm text-zinc-600 dark:text-zinc-500">
            Want the full profile page?{" "}
            <Link
              href={profilePageHref(member.slug, "full")}
              className="font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-4 transition hover:text-zinc-950 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:text-zinc-50"
            >
              Open full profile
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
