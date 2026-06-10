import { EditProgramIconLink } from "@/components/program/edit-program-icon-link";
import { ProgramHiddenBadge } from "@/components/program/ProgramHiddenBadge";
import { ShareProgramButton } from "@/components/program/share-program-button";
import type { Program } from "@/lib/member";
import { programThumbnailSrc } from "@/lib/program/thumbnail";
import { sessionThumbnailShellClass } from "@/lib/ui/page-layout";
import {
  bodyMutedClass,
  titleCardClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";
import Image from "next/image";
import Link from "next/link";

type ProgramListingCardProps = {
  program: Program;
  href: string;
  viewerOwnsProfile?: boolean;
  manageHref?: string;
  /** Hide subtitle when it repeats profile tagline/bio. */
  showSubtitle?: boolean;
  /** Use larger title scale for a lone featured program. */
  featured?: boolean;
};

export function ProgramListingCard({
  program,
  href,
  viewerOwnsProfile = false,
  manageHref,
  showSubtitle = true,
  featured = false,
}: ProgramListingCardProps) {
  const titleClass = featured ? titleSubsectionClass : titleCardClass;
  const thumbnailSrc = programThumbnailSrc(program);
  const sessionCount = program.sessions.length;
  const sessionLabel =
    sessionCount > 0
      ? `${sessionCount} session${sessionCount === 1 ? "" : "s"}`
      : null;
  const hiddenFromLearners = viewerOwnsProfile && !program.isActive;

  return (
    <article
      className={`group relative block h-full overflow-hidden rounded-xl border bg-editorial-card shadow-sm shadow-stone-900/5 transition hover:shadow-md dark:shadow-black/30 ${
        hiddenFromLearners
          ? "border-dashed border-stone-300 hover:border-stone-400 dark:border-stone-600 dark:hover:border-stone-500"
          : "border-editorial-border hover:border-editorial-accent-muted"
      }`.trim()}
    >
      <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5 rounded-lg bg-[var(--editorial-overlay)]/80 p-0.5 backdrop-blur-[2px]">
        <ShareProgramButton urlPath={href} title={program.title} />
        {viewerOwnsProfile && manageHref ? (
          <EditProgramIconLink href={manageHref} />
        ) : null}
      </div>

      <Link href={href} className="block h-full">
        <div className={sessionThumbnailShellClass}>
          {hiddenFromLearners ? (
            <div className="absolute left-2 top-2 z-10">
              <ProgramHiddenBadge variant="overlay" />
            </div>
          ) : null}
          {thumbnailSrc ? (
            <Image
              src={thumbnailSrc}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
              className={`object-cover object-center transition duration-500 ease-out group-hover:scale-[1.05] ${
                hiddenFromLearners ? "opacity-80 saturate-[0.65]" : ""
              }`.trim()}
            />
          ) : (
            <div
              className={`flex h-full items-center justify-center px-4 text-center text-xs text-stone-500 dark:text-stone-400 ${
                hiddenFromLearners ? "opacity-80" : ""
              }`.trim()}
            >
              No preview yet
            </div>
          )}
          {hiddenFromLearners ? (
            <div className="pointer-events-none absolute inset-0 bg-stone-950/10" aria-hidden />
          ) : null}
          <div className="absolute inset-0 bg-stone-950/0 transition duration-300 group-hover:bg-stone-950/25" />
          <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:p-4">
            <div className="space-y-2 rounded-lg bg-[var(--editorial-overlay)] px-3 py-2.5 text-stone-50 backdrop-blur-[2px]">
              {sessionLabel ? (
                <p className="text-xs font-medium text-stone-200/90">{sessionLabel}</p>
              ) : null}
              <p className="text-sm font-semibold text-stone-50">{program.price}</p>
              {program.topicTags.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                  {program.topicTags.map((tag) => (
                    <li key={tag.id}>
                      <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/95">
                        {tag.name}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-1.5 p-3 sm:hidden">
          <h2 className={`text-left ${titleClass}`}>{program.title}</h2>
          {showSubtitle && program.subtitle.trim() ? (
            <p className={bodyMutedClass}>{program.subtitle}</p>
          ) : null}
        </div>

        <div className="hidden space-y-1.5 border-t border-editorial-border px-4 py-3 sm:block">
          <h2 className={`text-left ${titleClass}`}>{program.title}</h2>
          {showSubtitle && program.subtitle.trim() ? (
            <p className={bodyMutedClass}>{program.subtitle}</p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
