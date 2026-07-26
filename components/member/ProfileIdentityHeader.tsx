import { ProfileEditIconLink } from "@/components/member/profile-edit-icon-link";
import { ProfileLayoutToggle } from "@/components/member/profile-layout-toggle";
import { ProfilePortrait } from "@/components/member/ProfilePortrait";
import { ReadonlyTopicChips } from "@/components/program/ReadonlyTopicChips";
import type { ProgramTopicTag } from "@/lib/member/types";
import {
  bodyRelaxedLargeClass,
  leadMutedClass,
  titleProfileClass,
  titleSmallClass,
} from "@/lib/ui/typography";

type Props = {
  name: string;
  slug: string;
  tagline: string | null;
  quote: string | null;
  bio: string | null;
  topicTags: ProgramTopicTag[];
  avatarUrl: string | null;
  viewerOwnsProfile: boolean;
};

/** Portrait + name beside; details stack full-width under on mobile only. */
export function ProfileIdentityHeader({
  name,
  slug,
  tagline,
  quote,
  bio,
  topicTags,
  avatarUrl,
  viewerOwnsProfile,
}: Props) {
  const hasDetails = Boolean(tagline || quote || bio || topicTags.length > 0);

  const details = hasDetails ? (
    <>
      {tagline ? <p className={leadMutedClass}>{tagline}</p> : null}

      {quote ? (
        <blockquote className="font-serif-display text-xl font-medium italic leading-snug text-stone-800 dark:text-stone-200 lg:text-2xl xl:text-[1.75rem] xl:leading-snug">
          &ldquo;{quote}&rdquo;
        </blockquote>
      ) : null}

      {bio ? <p className={bodyRelaxedLargeClass}>{bio}</p> : null}

      {topicTags.length > 0 ? (
        <ReadonlyTopicChips tags={topicTags} className="pt-1" />
      ) : null}
    </>
  ) : null;

  return (
    <header className="relative z-10 space-y-4 sm:space-y-0">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 sm:gap-8 lg:gap-12 xl:gap-16">
        <ProfilePortrait
          name={name}
          imageUrl={avatarUrl}
          className="w-28 sm:w-40 lg:w-60"
        />

        <div className="min-w-0 space-y-3 sm:space-y-4 lg:space-y-5">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <h1 className={titleProfileClass}>{name}</h1>
              <div className={titleSmallClass}>@{slug}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ProfileLayoutToggle slug={slug} active="full" />
              {viewerOwnsProfile ? (
                <ProfileEditIconLink href={`/${slug}/edit`} />
              ) : null}
            </div>
          </div>

          {details ? (
            <div className="hidden space-y-3 sm:block sm:space-y-4 lg:space-y-5">
              {details}
            </div>
          ) : null}
        </div>
      </div>

      {details ? (
        <div className="space-y-3 sm:hidden">{details}</div>
      ) : null}
    </header>
  );
}
