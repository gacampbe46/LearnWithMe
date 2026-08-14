import type { HomeSession } from "@/lib/home/placeholder-data";
import { sessionDisplayTitle } from "@/lib/home/session-display-title";
import { sessionThumbnailShellClass } from "@/lib/ui/page-layout";
import Image from "next/image";
import Link from "next/link";

type SessionCardProps = {
  session: HomeSession;
  className?: string;
};

export function SessionCard({ session, className = "" }: SessionCardProps) {
  const title = sessionDisplayTitle(session.title);
  const overlayMeta = [
    session.creatorName,
    session.duration,
    session.skillLevel,
  ]
    .filter(Boolean)
    .join(" · ");

  const footerMeta = [
    session.programName,
    session.duration,
    session.skillLevel,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={session.href}
      className={`group relative block overflow-hidden rounded-xl border border-editorial-border bg-editorial-card shadow-sm shadow-stone-900/5 transition hover:border-editorial-accent-muted hover:shadow-md dark:shadow-black/30 ${className}`.trim()}
    >
      <div className={sessionThumbnailShellClass}>
        <Image
          src={session.imageSrc}
          alt={session.imageAlt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
          className="object-cover object-center transition duration-500 ease-out group-hover:scale-[1.05]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 opacity-0 transition duration-300 group-hover:opacity-100 sm:p-4">
          <p className="min-w-0 font-serif-display text-lg font-medium leading-snug text-stone-50">
            {title}
          </p>
          {overlayMeta ? (
            <p className="max-w-[45%] shrink-0 text-right text-xs text-stone-200/90">
              {overlayMeta}
            </p>
          ) : null}
        </div>
      </div>
      <div className="space-y-1 p-3 sm:hidden">
        <p className="font-serif-display text-base font-medium leading-snug text-stone-900 dark:text-stone-50">
          {title}
        </p>
        <p className="text-xs text-stone-600 dark:text-stone-400">{footerMeta || overlayMeta}</p>
      </div>
      <div className="hidden border-t border-editorial-border px-4 py-3 sm:block">
        <p className="font-serif-display text-lg font-medium leading-snug text-stone-900 dark:text-stone-50">
          {title}
        </p>
        <p className="mt-0.5 text-xs uppercase tracking-[0.1em] text-stone-500">
          {footerMeta || overlayMeta}
        </p>
      </div>
    </Link>
  );
}
