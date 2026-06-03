import type { HomeSession } from "@/lib/home/placeholder-data";
import { sessionDisplayTitle } from "@/lib/home/session-display-title";
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
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-200 dark:bg-stone-800 sm:aspect-[5/4]">
        <Image
          src={session.imageSrc}
          alt={session.imageAlt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
          className="object-cover object-center transition duration-500 ease-out group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-stone-950/0 transition duration-300 group-hover:bg-stone-950/25" />
        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:p-4">
          <div className="rounded-lg bg-[var(--editorial-overlay)] px-3 py-2.5 text-stone-50 backdrop-blur-[2px]">
            <p className="font-serif-display text-lg font-medium leading-snug">{title}</p>
            <p className="mt-1 text-xs text-stone-200/90">{overlayMeta}</p>
          </div>
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
