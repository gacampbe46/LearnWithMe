import type { HomeCreator, HomeSession } from "@/lib/home/placeholder-data";
import Image from "next/image";
import Link from "next/link";
import { FeaturedSessionCard } from "./FeaturedSessionCard";

type CreatorSpotlightPanelProps = {
  creator: HomeCreator;
  sessions: HomeSession[];
  portraitSrc: string;
  portraitAlt: string;
};

export function CreatorSpotlightPanel({
  creator,
  sessions,
  portraitSrc,
  portraitAlt,
}: CreatorSpotlightPanelProps) {
  const profileHref = creator.href ?? "/kathleen";
  const firstName = creator.name.split(" ")[0];

  return (
    <div className="space-y-3 lg:space-y-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-editorial-accent">
        Creator spotlight
      </p>

      <div className="flex items-start gap-4 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-5">
        <div className="relative aspect-[4/5] w-36 shrink-0 overflow-hidden rounded-xl border border-editorial-border bg-stone-200 dark:bg-stone-800 sm:w-40 lg:w-auto lg:rounded-2xl">
          <Image
            src={portraitSrc}
            alt={portraitAlt}
            fill
            sizes="(max-width: 1023px) 160px, 240px"
            className="object-cover"
            priority
          />
        </div>

        <div className="min-w-0 flex-1 space-y-2.5 lg:space-y-4">
          <div className="space-y-0.5 lg:space-y-1">
            <h2 className="font-serif-display text-2xl font-semibold leading-tight text-stone-900 dark:text-stone-50 lg:text-3xl xl:text-4xl">
              {creator.name}
            </h2>
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
              {creator.role}
            </p>
          </div>
          <blockquote className="font-serif-display text-base font-medium italic leading-snug text-stone-800 dark:text-stone-200 lg:text-xl">
            &ldquo;{creator.quote}&rdquo;
          </blockquote>
          <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            {creator.bio}
          </p>
          <p className="text-xs text-stone-500">
            {creator.programCount} program{creator.programCount === 1 ? "" : "s"} ·{" "}
            {creator.sessionCount} sessions
          </p>
          <Link
            href={profileHref}
            className="inline-flex min-h-10 items-center rounded-full border border-stone-800 px-5 text-xs font-medium uppercase tracking-[0.12em] text-stone-900 transition hover:bg-stone-900 hover:text-stone-50 lg:min-h-11 lg:px-6 dark:border-stone-300 dark:text-stone-100 dark:hover:bg-stone-100 dark:hover:text-stone-900"
          >
            Learn with {firstName}
          </Link>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-editorial-accent">
          Featured sessions
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {sessions.map((session) => (
            <FeaturedSessionCard key={session.id} session={session} />
          ))}
        </div>
      </div>
    </div>
  );
}
