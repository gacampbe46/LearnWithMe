import { EditProgramIconLink } from "@/components/program/edit-program-icon-link";
import { Button } from "@/components/Button";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ProfileEditIconLink } from "@/components/member/profile-edit-icon-link";
import { ProfileLayoutToggle } from "@/components/member/profile-layout-toggle";
import { ProgramHiddenBadge } from "@/components/program/ProgramHiddenBadge";
import { ShareProgramButton } from "@/components/program/share-program-button";
import { type MemberProfile } from "@/lib/member";
import {
  bodyLeadClass,
  bodyMutedClass,
  navLinkClass,
  titleMediumClass,
  titleSmallClass,
} from "@/lib/ui/typography";
import { pageContainerClass, pageFocusedColumnClass } from "@/lib/ui/page-layout";
import Link from "next/link";

type Props = {
  member: MemberProfile;
  viewerOwnsProfile?: boolean;
};

/** Same footprint as hub “Create … program” `Button`: `w-full min-h-10 px-4 text-sm rounded-full` */
const hubProgramPillOuter =
  "relative flex h-10 w-full min-h-10 items-center overflow-hidden rounded-full bg-stone-900 px-4 text-sm font-medium text-stone-50 transition-colors hover:bg-stone-800 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stone-500 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white dark:focus-within:outline-stone-400";

const hubProgramPillHidden =
  "relative flex h-10 w-full min-h-10 items-center overflow-hidden rounded-full border-2 border-dashed border-stone-400 bg-stone-100 px-4 text-sm font-medium text-stone-600 transition-colors hover:border-stone-500 hover:bg-stone-50 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stone-400 dark:border-stone-500 dark:bg-stone-900/60 dark:text-stone-300 dark:hover:border-stone-400 dark:hover:bg-stone-900 dark:focus-within:outline-stone-500";

const hubProgramPillIconTone =
  "!text-stone-50 hover:!bg-white/15 hover:!text-white dark:!text-stone-900 dark:hover:!bg-black/10 dark:hover:!text-stone-900";

const hubProgramPillHiddenIconTone =
  "!text-stone-600 hover:!bg-stone-200/80 hover:!text-stone-800 dark:!text-stone-300 dark:hover:!bg-stone-800/80 dark:hover:!text-stone-100";

/** Full-width primary pill (matches program `Button` width); title link + share/manage in one bar. */
function CompactProgramRow({
  title,
  href,
  shareTitle,
  viewerOwnsProfile,
  manageHref,
  hiddenFromLearners = false,
}: {
  title: string;
  href: string;
  shareTitle: string;
  viewerOwnsProfile: boolean;
  manageHref: string;
  hiddenFromLearners?: boolean;
}) {
  const iconTone = hiddenFromLearners
    ? hubProgramPillHiddenIconTone
    : hubProgramPillIconTone;

  return (
    <li className="w-full">
      <div className={hiddenFromLearners ? hubProgramPillHidden : hubProgramPillOuter}>
        <Link
          href={href}
          className="absolute inset-0 z-0 rounded-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400 dark:focus-visible:outline-stone-500"
          title={title}
          aria-label={`Open program: ${title}${hiddenFromLearners ? " (hidden from users)" : ""}`}
        />
        {/* Match Create button content box; symmetric inset keeps title centered over full pill width */}
        <div className="relative z-10 flex h-full min-h-0 w-full items-center justify-center gap-2 px-[2.75rem] pointer-events-none sm:px-[3rem]">
          {hiddenFromLearners ? (
            <ProgramHiddenBadge variant="compact" className="pointer-events-none shrink-0" />
          ) : null}
          <span className="min-w-0 truncate text-center text-sm font-medium leading-normal">
            {title}
          </span>
        </div>
        <div className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 items-center gap-0.5 sm:right-4">
          <ShareProgramButton
            urlPath={href}
            title={shareTitle}
            className={iconTone}
          />
          {viewerOwnsProfile ? (
            <EditProgramIconLink
              href={manageHref}
              ariaLabel="Manage program"
              className={iconTone}
            />
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function MemberProfileLinkHub({
  member,
  viewerOwnsProfile = false,
}: Props) {
  const programs = member.programs;
  const primary = programs[0];
  const primaryPath = primary ? `/${member.slug}/${primary.id}` : null;

  const taglineTrim = member.tagline.trim();
  const bioTrim = member.bio.trim();
  const taglineBioDuplicate =
    taglineTrim.length > 0 && taglineTrim === bioTrim;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <main className={`${pageContainerClass} flex flex-1 flex-col py-8 pb-12`}>
        <div className={`${pageFocusedColumnClass} flex flex-1 flex-col`}>
        <nav className="mb-5">
          <Link href="/" className={navLinkClass}>
            ← Home
          </Link>
        </nav>

        <div className="flex flex-1 flex-col">
          <div className="text-center">
            <ProfileAvatar
              name={member.name}
              imageUrl={member.avatarUrl}
              size="lg"
              className="mx-auto mb-4 ring-4 ring-background"
            />
            <h1 className={titleMediumClass}>{member.name}</h1>
            <div className={`mt-1 ${titleSmallClass}`}>@{member.slug}</div>
            {taglineBioDuplicate ? (
              <p className={`mx-auto mt-2 max-w-sm text-sm leading-relaxed ${bodyMutedClass}`}>
                {taglineTrim}
              </p>
            ) : (
              <>
                {taglineTrim ? (
                  <p className={`mx-auto mt-2 max-w-sm text-sm ${bodyMutedClass}`}>
                    {member.tagline}
                  </p>
                ) : null}
                {bioTrim && bioTrim !== taglineTrim ? (
                  <p className={`mx-auto mt-2 max-w-sm text-sm ${bodyMutedClass}`}>
                    {member.bio}
                  </p>
                ) : null}
              </>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <ProfileLayoutToggle slug={member.slug} active="hub" />
              {viewerOwnsProfile ? (
                <ProfileEditIconLink href={`/${member.slug}/edit`} />
              ) : null}
            </div>
          </div>

          <section className="mt-6 space-y-3" aria-labelledby="hub-programs-heading">
            <h2 id="hub-programs-heading" className="sr-only">
              Programs
            </h2>
            {programs.length === 0 ? (
              <p className={bodyLeadClass}>No public program on this profile yet.</p>
            ) : programs.length === 1 && primary && primaryPath ? (
              <ul className="list-none space-y-3 p-0">
                <CompactProgramRow
                  title={primary.title}
                  href={primaryPath}
                  shareTitle={primary.title}
                  viewerOwnsProfile={viewerOwnsProfile}
                  manageHref={`/${member.slug}/${primary.id}/manage`}
                  hiddenFromLearners={
                    viewerOwnsProfile && !primary.isActive
                  }
                />
              </ul>
            ) : (
              <ul className="list-none space-y-3 p-0">
                {programs.map((p) => {
                  const href = `/${member.slug}/${p.id}`;
                  return (
                    <CompactProgramRow
                      key={p.id}
                      title={p.title}
                      href={href}
                      shareTitle={p.title}
                      viewerOwnsProfile={viewerOwnsProfile}
                      manageHref={`/${member.slug}/${p.id}/manage`}
                      hiddenFromLearners={
                        viewerOwnsProfile && !p.isActive
                      }
                    />
                  );
                })}
              </ul>
            )}
            {viewerOwnsProfile ? (
              <Button
                href="/teach/programs/new"
                variant="outline"
                className="mt-2 h-10 w-full justify-center px-4 text-sm font-medium"
              >
                {programs.length === 0 ? "Create program" : "Create another program"}
              </Button>
            ) : null}
          </section>
        </div>
        </div>
      </main>
    </div>
  );
}
