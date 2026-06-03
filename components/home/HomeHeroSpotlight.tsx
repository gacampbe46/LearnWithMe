import { spotlightCreator } from "@/lib/home/placeholder-data";
import type { KathleenSpotlight } from "@/lib/home/resolve-home-kathleen";
import Link from "next/link";
import { CreatorSpotlightPanel } from "./CreatorSpotlightPanel";

type HomeHeroSpotlightProps = {
  spotlight: KathleenSpotlight;
};

export function HomeHeroSpotlight({ spotlight }: HomeHeroSpotlightProps) {
  return (
    <section
      id="hero"
      className="scroll-mt-20 border-b border-editorial-border pb-8 pt-2 sm:pb-10"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10">
          <div className="order-1 flex flex-col justify-center space-y-5 lg:order-none lg:space-y-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-editorial-accent">
              learnwithme
            </p>
            <h1 className="font-serif-display text-[2.35rem] font-semibold leading-[1.02] text-stone-900 dark:text-stone-50 sm:text-5xl md:text-6xl lg:text-[3.35rem]">
              Learn from creators you trust
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-stone-600 dark:text-stone-400 sm:text-lg">
              Tutorials, courses, and how-tos from creators that resonate with you.
              Teach or learn skills in fitness, sewing, 3D printing, and more — all in
              one place.
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="#featured-creators"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-stone-900 px-6 text-xs font-medium uppercase tracking-[0.12em] text-stone-50 transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
              >
                Explore creators
              </Link>
              <Link
                href={spotlight.sampleProgramHref}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-800 px-6 text-xs font-medium uppercase tracking-[0.12em] text-stone-900 transition hover:bg-stone-900/5 dark:border-stone-300 dark:text-stone-100 dark:hover:bg-stone-800/40"
              >
                View sample program
              </Link>
            </div>
          </div>

          <div className="order-2 lg:order-none">
            <CreatorSpotlightPanel
              creator={spotlightCreator}
              sessions={spotlight.sessions}
              portraitSrc={spotlight.portraitSrc}
              portraitAlt={spotlight.portraitAlt}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
