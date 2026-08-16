import { CreateProgramCard } from "@/components/program/CreateProgramCard";
import { ProgramListingCard } from "@/components/program/ProgramListingCard";
import { ProfileBanner } from "@/components/member/ProfileBanner";
import { ProfileIdentityHeader } from "@/components/member/ProfileIdentityHeader";
import { StartWithSessionSection } from "@/components/member/StartWithSessionSection";
import { SectionHeader } from "@/components/SectionHeader";
import {
  profileTopicTags,
  resolveFeaturedSessions,
  type MemberProfile,
  type PurchasedProgramCard,
} from "@/lib/member";
import { bodyLeadClass } from "@/lib/ui/typography";
import { programGridClass } from "@/lib/ui/page-layout";

type Props = {
  member: MemberProfile;
  viewerOwnsProfile?: boolean;
  purchasedPrograms?: PurchasedProgramCard[];
};

const pad = "px-5 sm:px-8 lg:px-12 xl:px-16";

export function MemberProfileFullContent({
  member: t,
  viewerOwnsProfile = false,
  purchasedPrograms = [],
}: Props) {
  const programs = t.programs;
  const featuredSessions = resolveFeaturedSessions(t);
  const topicTags = profileTopicTags(t);
  const bannerUrl = t.bannerUrl?.trim() || null;

  const tagline = t.tagline.trim();
  const bio = t.bio.trim();
  const quote = t.quote.trim();
  const taglineIsBio = tagline.length > 0 && tagline === bio;

  const showSubtitle = (subtitle: string) => {
    const s = subtitle.trim();
    return s.length > 0 && s !== tagline && s !== bio;
  };

  const bioText =
    bio && !taglineIsBio ? t.bio : taglineIsBio ? tagline : bio || null;

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden">
      <main className="relative z-10 w-full flex-1 pb-14 pt-6">
        <div className={pad}>
          <ProfileBanner bannerUrl={bannerUrl} />
        </div>

        <div className={`${pad} space-y-12 pt-8 lg:space-y-14 lg:pt-10`}>
          <ProfileIdentityHeader
            name={t.name}
            slug={t.slug}
            tagline={tagline && !taglineIsBio ? t.tagline : null}
            quote={quote || null}
            bio={bioText}
            topicTags={topicTags}
            avatarUrl={t.avatarUrl}
            viewerOwnsProfile={viewerOwnsProfile}
          />

          <section className="space-y-4" id="programs">
            <SectionHeader
              title="Programs"
              subtitle="Open one below to follow along—it's structured session by session."
            />
            {programs.length === 0 && !viewerOwnsProfile ? (
              <p className={bodyLeadClass}>
                No public program on this profile yet.
              </p>
            ) : (
              <ul className={programGridClass}>
                {programs.map((p) => (
                  <li key={p.id} className="min-w-0">
                    <ProgramListingCard
                      program={p}
                      href={`/${t.slug}/${p.id}`}
                      viewerOwnsProfile={viewerOwnsProfile}
                      manageHref={`/${t.slug}/${p.id}/manage`}
                      showSubtitle={showSubtitle(p.subtitle)}
                      featured={programs.length === 1}
                    />
                  </li>
                ))}
                {viewerOwnsProfile ? (
                  <li className="min-w-0">
                    <CreateProgramCard hasPrograms={programs.length > 0} />
                  </li>
                ) : null}
              </ul>
            )}
          </section>

          {purchasedPrograms.length > 0 ? (
            <section className="space-y-4" id="purchased">
              <SectionHeader
                title="Purchased"
                subtitle="Programs you've bought — open one to keep learning."
              />
              <ul className={programGridClass}>
                {purchasedPrograms.map((item) => (
                  <li key={item.program.id} className="min-w-0">
                    <ProgramListingCard
                      program={item.program}
                      href={item.href}
                      showSubtitle={showSubtitle(item.program.subtitle)}
                      featured={purchasedPrograms.length === 1}
                      byline={`By ${item.creatorName}`}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <StartWithSessionSection
            sessions={featuredSessions}
            creatorName={t.name}
          />
        </div>
      </main>
    </div>
  );
}
