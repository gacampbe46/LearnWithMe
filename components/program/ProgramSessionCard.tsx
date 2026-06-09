import type { ProgramSession } from "@/lib/member";
import { youtubeThumb } from "@/lib/home/media";
import { metaCapsClass, titleCardClass } from "@/lib/ui/typography";
import Image from "next/image";
import Link from "next/link";

type ProgramSessionCardProps = {
  session: ProgramSession;
  href: string;
  sessionNumber?: number;
  sessionTotal?: number;
  className?: string;
};

export function ProgramSessionCard({
  session,
  href,
  sessionNumber,
  sessionTotal,
  className = "",
}: ProgramSessionCardProps) {
  const videoId = session.media[0]?.videoId?.trim() ?? "";
  const showNumber =
    sessionTotal != null && sessionTotal > 1 && sessionNumber != null;
  const description = session.description.trim();

  return (
    <Link
      href={href}
      className={`group relative block h-full overflow-hidden rounded-xl border border-editorial-border bg-editorial-card shadow-sm shadow-stone-900/5 transition hover:border-editorial-accent-muted hover:shadow-md dark:shadow-black/30 ${className}`.trim()}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-200 dark:bg-stone-800 sm:aspect-[5/4]">
        {videoId ? (
          <Image
            src={youtubeThumb(videoId)}
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
        <div className="absolute inset-0 bg-stone-950/0 transition duration-300 group-hover:bg-stone-950/25" />
        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:p-4">
          <div className="rounded-lg bg-[var(--editorial-overlay)] px-3 py-2.5 text-stone-50 backdrop-blur-[2px]">
            {showNumber ? (
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-stone-300">
                Session {sessionNumber} of {sessionTotal}
              </p>
            ) : null}
            <p className="font-serif-display text-lg font-medium leading-snug">
              {session.title}
            </p>
            {description ? (
              <p className="mt-1 line-clamp-2 text-xs text-stone-200/90">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="space-y-1 p-3 sm:hidden">
        {showNumber ? (
          <p className={metaCapsClass}>
            Session {sessionNumber} of {sessionTotal}
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
