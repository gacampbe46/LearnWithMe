import type { InterestTagOption } from "@/lib/catalog/interest-tags";
import { featuredCreators } from "@/lib/home/placeholder-data";
import type { HomeKathleenContent } from "@/lib/home/resolve-home-kathleen";
import Link from "next/link";
import { CreatorCard } from "./CreatorCard";
import { HomeHeroSpotlight } from "./HomeHeroSpotlight";
import { HomeInterestsSection } from "./HomeInterestsSection";
import { HomeSectionHeader } from "./HomeSectionHeader";
import { SessionCard } from "./SessionCard";

type HomePageProps = {
  interestTags: InterestTagOption[];
  tagsLoadError: string | null;
  kathleen: HomeKathleenContent;
};

export function HomePage({ interestTags, tagsLoadError, kathleen }: HomePageProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <HomeHeroSpotlight spotlight={kathleen.spotlight} />

      <HomeInterestsSection interests={interestTags} loadError={tagsLoadError} />

      <section
        id="featured-creators"
        className="scroll-mt-20 border-b border-editorial-border py-8 sm:py-10"
      >
        <div className="mx-auto max-w-6xl space-y-5 px-4 sm:px-6 lg:px-8">
          <HomeSectionHeader
            eyebrow="Featured creators"
            title="Meet the creators"
            subtitle="See who they are, what they teach, and which programs and sessions they offer."
          />
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
            {featuredCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} className="lg:w-auto" />
            ))}
          </div>
        </div>
      </section>

      <section id="popular-sessions" className="py-8 sm:py-10">
        <div className="mx-auto max-w-6xl space-y-5 px-4 sm:px-6 lg:px-8">
          <HomeSectionHeader
            eyebrow="Popular sessions"
            title="Start with one session"
            subtitle="Tap a session to preview, then open the full program when you're ready."
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {kathleen.popularSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-editorial-border py-8 sm:py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-xs text-stone-500 sm:px-6 lg:px-8">
          <Link href="/about" className="hover:text-stone-800 dark:hover:text-stone-300">
            Why we&apos;re building this
          </Link>
          <Link href="/conduct" className="hover:text-stone-800 dark:hover:text-stone-300">
            Code of conduct
          </Link>
        </div>
      </footer>
    </div>
  );
}
