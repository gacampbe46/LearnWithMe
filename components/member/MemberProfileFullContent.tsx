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
} from "@/lib/member";
import { bodyLeadClass, navLinkClass } from "@/lib/ui/typography";
import { programGridClass } from "@/lib/ui/page-layout";
import Link from "next/link";

type Props = {
  member: MemberProfile;
  /** True when `?layout=` is present — show link back to automatic layout. */
  hasLayoutQuery?: boolean;
  /** Signed-in viewer is this profile owner — show Edit on program cards. */
  viewerOwnsProfile?: boolean;
};

const contentPadClass = "px-5 sm:px-8 lg:px-12 xl:px-16";

export function MemberProfileFullContent({
  member: t,
  viewerOwnsProfile = false,
}: Props) {
  const programs = t.programs;
  const featuredSessions = resolveFeaturedSessions(t);
  const topicTags = profileTopicTags(t);
  const bannerUrl = t.bannerUrl?.trim() || null;

  const taglineTrim = t.tagline.trim();
  const bioTrim = t.bio.trim();
  const quoteTrim = t.quote.trim();
  const taglineBioDuplicate =
    taglineTrim.length > 0 && taglineTrim === bioTrim;

  const programSubtitleRedundant = (subtitle: string) => {
    const s = subtitle.trim();
    return (
      s.length === 0 || s === taglineTrim || s === bioTrim
    );
  };

  const bioText =
    bioTrim && (!taglineBioDuplicate || !taglineTrim)
      ? t.bio
      : taglineBioDuplicate && taglineTrim
        ? taglineTrim
        : null;

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden">
      <main className="relative z-10 w-full flex-1 pb-14">
        <nav className={`${contentPadClass} py-6`}>
          <Link href="/" className={navLinkClass}>
            ← Home
          </Link>
        </nav>

        <div className={`${contentPadClass}`}>
          <ProfileBanner bannerUrl={bannerUrl} />
        </div>

        <div className={`${contentPadClass} space-y-12 pt-8 lg:space-y-14 lg:pt-10`}>
          <ProfileIdentityHeader
            name={t.name}
            slug={t.slug}
            tagline={
              taglineTrim && !taglineBioDuplicate ? t.tagline : null
            }
            quote={quoteTrim || null}
            bio={bioText}
            topicTags={topicTags}
            avatarUrl={t.avatarUrl}
            viewerOwnsProfile={viewerOwnsProfile}
          />

          <section className="space-y-4" id="programs">
            <SectionHeader
              title="Programs"
              subtitle={`Open one below to follow along—it's structured session by session.`}
            />
            {programs.length === 0 && !viewerOwnsProfile ? (
              <p className={bodyLeadClass}>
                No public program on this profile yet.
              </p>
            ) : (
              <ul className={programGridClass}>
                {programs.map((p) => {
                  const href = `/${t.slug}/${p.id}`;
                  return (
                    <li key={p.id} className="min-w-0">
                      <ProgramListingCard
                        program={p}
                        href={href}
                        viewerOwnsProfile={viewerOwnsProfile}
                        manageHref={`/${t.slug}/${p.id}/manage`}
                        showSubtitle={!programSubtitleRedundant(p.subtitle)}
                        featured={programs.length === 1}
                      />
                    </li>
                  );
                })}
                {viewerOwnsProfile ? (
                  <li className="min-w-0">
                    <CreateProgramCard hasPrograms={programs.length > 0} />
                  </li>
                ) : null}
              </ul>
            )}
          </section>

          <StartWithSessionSection
            sessions={featuredSessions}
            creatorName={t.name}
          />
        </div>
      </main>
    </div>
  );
}
