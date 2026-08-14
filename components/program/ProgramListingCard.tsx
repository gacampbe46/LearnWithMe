import { EditProgramIconLink } from "@/components/program/edit-program-icon-link";
import { ProgramHiddenBadge } from "@/components/program/ProgramHiddenBadge";
import { ShareProgramButton } from "@/components/program/share-program-button";
import type { Program } from "@/lib/member";
import { programThumbnailSrc } from "@/lib/program/thumbnail";
import { sessionThumbnailShellClass } from "@/lib/ui/page-layout";
import { bodyMutedClass, titleCardClass, titleSubsectionClass } from "@/lib/ui/typography";
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

const cardIconClass =
  "!text-stone-50 hover:!bg-white/20 hover:!text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]";

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
  const subtitle =
    showSubtitle && program.subtitle.trim() ? program.subtitle : null;
  const price = program.price.trim();

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl border bg-editorial-card shadow-sm shadow-stone-900/5 transition hover:shadow-md dark:shadow-black/30 ${
        hiddenFromLearners
          ? "border-dashed border-stone-300 hover:border-stone-400 dark:border-stone-600 dark:hover:border-stone-500"
          : "border-editorial-border hover:border-editorial-accent-muted"
      }`.trim()}
    >
      <div className="relative">
        <Link href={href} className="block min-w-0">
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
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 opacity-0 transition duration-300 group-hover:opacity-100 sm:p-4">
              <div className="min-w-0">
                <p className="font-serif-display text-lg font-medium leading-snug text-stone-50">
                  {program.title}
                </p>
                {sessionLabel ? (
                  <p className="mt-0.5 text-xs text-stone-200/90">{sessionLabel}</p>
                ) : null}
              </div>
              {price ? (
                <p className="shrink-0 text-lg font-medium text-stone-50">{price}</p>
              ) : null}
            </div>
          </div>
        </Link>
        <div className="absolute right-2 top-2 z-10 flex items-center">
          <ShareProgramButton
            urlPath={href}
            title={program.title}
            className={cardIconClass}
          />
          {viewerOwnsProfile && manageHref ? (
            <EditProgramIconLink href={manageHref} className={cardIconClass} />
          ) : null}
        </div>
      </div>

      <Link
        href={href}
        className="space-y-0.5 border-t border-editorial-border px-3 py-3 sm:px-4"
      >
        <h2 className={`text-left ${titleClass}`}>{program.title}</h2>
        {subtitle ? <p className={bodyMutedClass}>{subtitle}</p> : null}
      </Link>
    </article>
  );
}
