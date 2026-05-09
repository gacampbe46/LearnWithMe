import { EditProgramIconLink } from "@/components/program/edit-program-icon-link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ProfileEditIconLink } from "@/components/member/profile-edit-icon-link";
import { ProfileLayoutToggle } from "@/components/member/profile-layout-toggle";
import { SectionHeader } from "@/components/SectionHeader";
import { ReadonlyTopicChips } from "@/components/program/ReadonlyTopicChips";
import { ShareProgramButton } from "@/components/program/share-program-button";
import { type MemberProfile } from "@/lib/member";
import {
  bodyEmphasisClass,
  bodyStrongClass,
  bodyLeadClass,
  bodyMutedClass,
  bodyRelaxedLargeClass,
  leadMutedClass,
  navLinkClass,
  titleSmallClass,
  titleCardClass,
  titleProfileClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";
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
  const primaryProgram = programs[0];
  const primaryProgramPath = primaryProgram
    ? `/${t.slug}/${primaryProgram.id}`
    : null;

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
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 pb-14">
        <div className="space-y-12">
          <nav>
            <Link href="/" className={navLinkClass}>
              ← Home
            </Link>
          </nav>

          <header className="space-y-4">
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
            ) : (
              <>
                {taglineTrim ? (
                  <p className={leadMutedClass}>{t.tagline}</p>
                ) : null}
                {bioTrim && bioTrim !== taglineTrim ? (
                  <p className={bodyRelaxedLargeClass}>{t.bio}</p>
                ) : null}
              </>
            )}
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
            {programs.length === 0 ? (
              <p className={bodyLeadClass}>
                No public program on this profile yet.
              </p>
            ) : programs.length === 1 && primaryProgram && primaryProgramPath ? (
              <Card className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2
                      className={`min-w-0 flex-1 text-left ${titleSubsectionClass}`}
                    >
                      {primaryProgram.title}
                    </h2>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <ShareProgramButton
                        urlPath={primaryProgramPath}
                        title={primaryProgram.title}
                      />
                      {viewerOwnsProfile ? (
                        <EditProgramIconLink
                          href={`/${t.slug}/${primaryProgram.id}/manage`}
                        />
                      ) : null}
                    </div>
                  </div>
                  {!programSubtitleRedundant(primaryProgram.subtitle) ? (
                    <p className={bodyMutedClass}>{primaryProgram.subtitle}</p>
                  ) : null}
                </div>
                <p className={bodyEmphasisClass}>{primaryProgram.price}</p>
                <ReadonlyTopicChips
                  tags={primaryProgram.topicTags}
                  className="mt-3"
                />
                <Button href={primaryProgramPath} className="w-full">
                  View Program
                </Button>
              </Card>
            ) : (
              <ul className="space-y-3">
                {programs.map((p) => {
                  const href = `/${t.slug}/${p.id}`;
                  return (
                    <li key={p.id}>
                      <Card className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h2
                              className={`min-w-0 flex-1 text-left ${titleCardClass}`}
                            >
                              {p.title}
                            </h2>
                            <div className="flex shrink-0 items-center gap-0.5">
                              <ShareProgramButton urlPath={href} title={p.title} />
                              {viewerOwnsProfile ? (
                                <EditProgramIconLink
                                  href={`/${t.slug}/${p.id}/manage`}
                                />
                              ) : null}
                            </div>
                          </div>
                          {!programSubtitleRedundant(p.subtitle) ? (
                            <p className={bodyMutedClass}>{p.subtitle}</p>
                          ) : null}
                        </div>
                        <p className={bodyStrongClass}>{p.price}</p>
                        <ReadonlyTopicChips tags={p.topicTags} className="mt-2" />
                        <Button href={href} className="w-full">
                          View Program
                        </Button>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
            {viewerOwnsProfile ? (
              <div className="pt-1">
                <Button
                  href="/teach/programs/new"
                  variant="outline"
                  className="w-full min-h-10 justify-center px-5 text-sm font-medium"
                >
                  {programs.length === 0 ? "Create program" : "Create another program"}
                </Button>
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}
