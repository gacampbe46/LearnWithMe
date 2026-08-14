import type { ProgramSession } from "@/lib/member";
import { sessionThumbnailSrc } from "@/lib/program/thumbnail";
import { sessionThumbnailShellClass } from "@/lib/ui/page-layout";
import { metaCapsClass, titleCardClass } from "@/lib/ui/typography";
import Image from "next/image";
import Link from "next/link";

type ProgramSessionCardProps = {
  session: ProgramSession;
  href: string;
  sessionNumber?: number;
  sessionTotal?: number;
  completed?: boolean;
  className?: string;
};

export function ProgramSessionCard({
  session,
  href,
  sessionNumber,
  sessionTotal,
  completed = false,
  className = "",
}: ProgramSessionCardProps) {
  const thumbnailSrc = sessionThumbnailSrc(session);
  const showNumber =
    sessionTotal != null && sessionTotal > 1 && sessionNumber != null;
  const description = session.description.trim();

  return (
    <Link
      href={href}
      className={`group relative block h-full overflow-hidden rounded-xl border border-editorial-border bg-editorial-card shadow-sm shadow-stone-900/5 transition hover:border-editorial-accent-muted hover:shadow-md dark:shadow-black/30 ${className}`.trim()}
    >
      <div className={sessionThumbnailShellClass}>
        {completed ? (
          <div className="absolute left-2 top-2 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-stone-950/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-stone-50 backdrop-blur-[2px]">
              Completed
            </span>
          </div>
        ) : null}
        {thumbnailSrc ? (
          <Image
            src={thumbnailSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
            className="object-cover object-center transition duration-500 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs text-stone-500 dark:text-stone-400">
            No preview yet
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 opacity-0 transition duration-300 group-hover:opacity-100 sm:p-4">
          <p className="min-w-0 font-serif-display text-lg font-medium leading-snug text-stone-50">
            {session.title}
          </p>
          {showNumber ? (
            <p className="shrink-0 text-xs text-stone-200/90">
              {sessionNumber}/{sessionTotal}
            </p>
          ) : null}
        </div>
      </div>
      <div className="space-y-1 p-3 sm:hidden">
        {showNumber ? (
          <p className={metaCapsClass}>
            Session {sessionNumber} of {sessionTotal}
            {completed ? " · Completed" : ""}
          </p>
        ) : null}
        <p className={titleCardClass}>{session.title}</p>
        {description ? (
          <p className="line-clamp-2 text-xs text-stone-600 dark:text-stone-400">
            {description}
          </p>
        ) : null}
      </div>
      <div className="hidden border-t border-editorial-border px-4 py-3 sm:block">
        {showNumber ? (
          <p className={metaCapsClass}>
            Session {sessionNumber} of {sessionTotal}
            {completed ? " · Completed" : ""}
          </p>
        ) : null}
        <p className={`${titleCardClass} ${showNumber ? "mt-0.5" : ""}`}>
          {session.title}
        </p>
        {description ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-stone-600 dark:text-stone-400">
            {description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
