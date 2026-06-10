import type { HomeSession } from "@/lib/home/placeholder-data";
import { sessionThumbnailShellClass } from "@/lib/ui/page-layout";
import Image from "next/image";
import Link from "next/link";

type FeaturedSessionCardProps = {
  session: HomeSession;
};

export function FeaturedSessionCard({ session }: FeaturedSessionCardProps) {
  const meta = [session.duration, session.skillLevel].filter(Boolean).join(" · ");

  return (
    <Link
      href={session.href}
      className="group block overflow-hidden rounded-xl ring-1 ring-stone-900/8 transition hover:ring-stone-900/15"
    >
      <div className={sessionThumbnailShellClass}>
        <Image
          src={session.imageSrc}
          alt={session.imageAlt}
          fill
          sizes="(max-width: 640px) 30vw, 200px"
          className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/52 px-2.5 py-3 text-center backdrop-blur-[1px] transition group-hover:bg-stone-950/58">
          <p className="font-serif-display text-[11px] font-medium leading-snug text-white sm:text-xs">
            {session.title}
          </p>
          {session.programName ? (
            <p className="mt-1.5 text-[10px] leading-snug text-white/90 sm:text-[11px]">
              {session.programName}
            </p>
          ) : null}
          {meta ? (
            <p className="mt-0.5 text-[10px] text-white/75 sm:text-[11px]">· {meta}</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
