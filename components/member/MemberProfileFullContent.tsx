import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ChannelVideoPreview } from "@/components/ChannelVideoPreview";
import { SectionHeader } from "@/components/SectionHeader";
import { StickyBottomCTA } from "@/components/StickyBottomCTA";
import type { MemberProfile } from "@/data/member";
import { profilePageHref } from "@/lib/profileLayoutQuery";
import Link from "next/link";

type Props = {
  member: MemberProfile;
  /** True when `?layout=` is present — show link back to automatic layout. */
  hasLayoutQuery?: boolean;
};

export function MemberProfileFullContent({
  member: t,
  hasLayoutQuery = false,
}: Props) {
  const programPath = t.program ? `/${t.slug}/${t.program.id}` : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 pb-28">
        <div className="space-y-12">
          <nav>
            <Link
              href="/"
              className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100"
            >
              ← Home
            </Link>
          </nav>

          <header className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-500">
              Member
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ProfileAvatar name={t.name} size="md" />
              <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {t.name}
              </h1>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-500">
              Sample profile — members can both offer programs and subscribe to
              others.
            </p>
            <p className="text-xl font-medium text-zinc-800 dark:text-zinc-200">
              {t.tagline}
            </p>
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t.bio}
            </p>
          </header>

          {t.whatYouNeed && t.whatYouNeed.length > 0 ? (
            <section className="space-y-4">
              <SectionHeader
                title="What you'll need"
                subtitle="For the free sample sessions below"
              />
              <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                {t.whatYouNeed.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <ChannelVideoPreview videos={t.featuredPreviewVideos} />

          {programPath && t.program ? (
            <>
              <p>
                <Link
                  href={programPath}
                  className="text-base font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-4 transition hover:text-zinc-950 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:text-zinc-50 dark:hover:decoration-zinc-300"
                >
                  Open the full program — every session included
                </Link>
              </p>

              <Card className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {t.program.title}
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {t.program.subtitle}
                  </p>
                </div>
                <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  {t.program.price}
                </p>
                <Button href={programPath} className="w-full">
                  View Program
                </Button>
              </Card>
            </>
          ) : (
            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              No public program on this profile yet.
            </p>
          )}

          <div className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
            <div className="text-center text-sm text-zinc-600 dark:text-zinc-500">
              Prefer a compact link list?{" "}
              <Link
                href={profilePageHref(t.slug, "hub")}
                className="font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-4 transition hover:text-zinc-950 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:text-zinc-50"
              >
                Open link hub
              </Link>
            </div>
          </div>
        </div>
      </main>

      <StickyBottomCTA>
        {programPath ? (
          <Button href={programPath} className="min-h-12 flex-1">
            View Program
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          className="min-h-12 shrink-0 px-4"
          disabled
          aria-disabled
          title="Coming soon"
        >
          Subscribe
        </Button>
      </StickyBottomCTA>
    </div>
  );
}
