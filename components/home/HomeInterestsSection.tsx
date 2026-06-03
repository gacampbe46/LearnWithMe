import type { InterestTagOption } from "@/lib/catalog/interest-tags";
import { CategoryPill } from "./CategoryPill";
import { HomeSectionHeader } from "./HomeSectionHeader";

type HomeInterestsSectionProps = {
  interests: InterestTagOption[];
  loadError: string | null;
};

function isOtherLabel(label: string): boolean {
  return label.trim().toLowerCase() === "other";
}

export function HomeInterestsSection({ interests, loadError }: HomeInterestsSectionProps) {
  const browseInterests = interests.filter((t) => !isOtherLabel(t.label));

  return (
    <section id="categories" className="border-b border-editorial-border py-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        <HomeSectionHeader
          eyebrow="Learn by vibe"
          title="Browse by what you're in the mood for"
        />
        {loadError ? (
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Interests are temporarily unavailable.{" "}
            <a href="#featured-creators" className="underline underline-offset-2">
              Explore creators
            </a>{" "}
            instead.
          </p>
        ) : browseInterests.length === 0 ? (
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Interests coming soon — explore featured creators below.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {browseInterests.map((interest) => (
              <CategoryPill
                key={interest.id}
                label={interest.label}
                href="#featured-creators"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
