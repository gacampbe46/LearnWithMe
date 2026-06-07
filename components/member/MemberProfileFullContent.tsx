import { CreateProgramCard } from "@/components/program/CreateProgramCard";
import { ProgramListingCard } from "@/components/program/ProgramListingCard";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ProfileEditIconLink } from "@/components/member/profile-edit-icon-link";
import { ProfileLayoutToggle } from "@/components/member/profile-layout-toggle";
import { SectionHeader } from "@/components/SectionHeader";
import { type MemberProfile } from "@/lib/member";
import {
  bodyLeadClass,
  bodyRelaxedLargeClass,
  leadMutedClass,
  navLinkClass,
  titleSmallClass,
  titleProfileClass,
} from "@/lib/ui/typography";
import { pageMainClass, programGridClass } from "@/lib/ui/page-layout";
import Link from "next/link";

type Props = {
  member: MemberProfile;
  /** True when `?layout=` is present — show link back to automatic layout. */
  hasLayoutQuery?: boolean;
  /** Signed-in viewer is this profile owner — show Edit on program cards. */
  viewerOwnsProfile?: boolean;
  /** Signed-in owner’s OAuth avatar URL (same as top-right account). */
  viewerAvatarUrl?: string | null;
};

export function MemberProfileFullContent({
  member: t,
  viewerOwnsProfile = false,
  viewerAvatarUrl = null,
}: Props) {
  const programs = t.programs;

  const taglineTrim = t.tagline.trim();
  const bioTrim = t.bio.trim();
  const taglineBioDuplicate =
    taglineTrim.length > 0 && taglineTrim === bioTrim;

  const programSubtitleRedundant = (subtitle: string) => {
    const s = subtitle.trim();
    return (
      s.length === 0 || s === taglineTrim || s === bioTrim
    );
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <main className={`${pageMainClass} pb-14`}>
        <div className="space-y-12">
          <nav>
            <Link href="/" className={navLinkClass}>
              ← Home
            </Link>
          </nav>

          <header className="space-y-6 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-10 lg:space-y-0">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <ProfileAvatar
                    name={t.name}
                    imageUrl={viewerOwnsProfile ? viewerAvatarUrl : null}
                    size="md"
                  />
                  <div className="min-w-0">
                    <h1 className={titleProfileClass}>{t.name}</h1>
                    <div className={titleSmallClass}>@{t.slug}</div>
                  </div>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-2">
                  <ProfileLayoutToggle slug={t.slug} active="full" />
                  {viewerOwnsProfile ? (
                    <ProfileEditIconLink href={`/${t.slug}/edit`} />
                  ) : null}
                </div>
              </div>
              {taglineBioDuplicate ? (
                <p className={bodyRelaxedLargeClass}>{taglineTrim}</p>
              ) : taglineTrim ? (
                <p className={leadMutedClass}>{t.tagline}</p>
              ) : null}
            </div>
            {!taglineBioDuplicate && bioTrim && bioTrim !== taglineTrim ? (
              <p className={`${bodyRelaxedLargeClass} lg:pt-2`}>{t.bio}</p>
            ) : null}
          </header>

          {t.whatYouNeed && t.whatYouNeed.length > 0 ? (
            <section className="space-y-4">
              <SectionHeader
                title="What you'll need"
                subtitle="Anything useful to gather before you start."
              />
              <ul className={`list-disc space-y-2 pl-5 ${bodyLeadClass}`}>
                {t.whatYouNeed.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

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
        </div>
      </main>
    </div>
  );
}
