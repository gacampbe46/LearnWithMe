import type { HomeCreator } from "@/lib/home/placeholder-data";
import Image from "next/image";
import Link from "next/link";

type CreatorCardProps = {
  creator: HomeCreator;
  className?: string;
};

export function CreatorCard({ creator, className = "" }: CreatorCardProps) {
  const ctaLabel = `Learn with ${creator.name.split(" ")[0]}`;

  const content = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-editorial-border bg-stone-200 dark:bg-stone-800">
        <Image
          src={creator.imageSrc}
          alt={creator.imageAlt}
          fill
          sizes="(max-width: 640px) 72vw, (max-width: 1024px) 33vw, 280px"
          className="object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent opacity-80 transition group-hover:opacity-90" />
      </div>
      <div className="space-y-2 pt-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-editorial-accent">
          {creator.role}
        </p>
        <h3 className="font-serif-display text-2xl font-semibold leading-tight text-stone-900 dark:text-stone-50">
          {creator.name}
        </h3>
        <p className="line-clamp-2 text-sm leading-snug text-stone-600 dark:text-stone-400">
          {creator.bio}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-500">
          {creator.programCount} program{creator.programCount === 1 ? "" : "s"} ·{" "}
          {creator.sessionCount} sessions
        </p>
        <span className="inline-flex pt-1 text-xs font-medium uppercase tracking-[0.1em] text-stone-800 underline decoration-editorial-accent-muted underline-offset-4 transition group-hover:decoration-editorial-accent dark:text-stone-200">
          {ctaLabel}
        </span>
      </div>
    </>
  );

  const shellClass =
    `group flex w-[min(72vw,280px)] shrink-0 snap-start flex-col sm:w-[260px] lg:w-full lg:shrink ${className}`.trim();

  if (creator.href) {
    return (
      <Link href={creator.href} className={`${shellClass} cursor-pointer`}>
        {content}
      </Link>
    );
  }

  return (
    <article className={shellClass} aria-label={`${creator.name} — coming soon`}>
      {content}
    </article>
  );
}
