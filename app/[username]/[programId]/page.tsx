import { EditProgramIconLink } from "@/components/program/edit-program-icon-link";
import { ProgramSessionGrid } from "@/components/program/program-session-grid";
import { BeginProgramCta } from "@/components/program/begin-program-cta";
import { ShareProgramButton } from "@/components/program/share-program-button";
import { ReadonlyTopicChips } from "@/components/program/ReadonlyTopicChips";
import { loadProgramDetail } from "@/lib/program/load-program-detail";
import { userHasProgramAccess } from "@/lib/stripe/entitlements";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  bodyEmphasisClass,
  bodyLeadClass,
  navLinkClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";
import { pageMainStickyClass } from "@/lib/ui/page-layout";

type PageProps = {
  params: Promise<{ username: string; programId: string }>;
  searchParams: Promise<{ checkout?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username, programId } = await params;
  const loaded = await loadProgramDetail(username, programId);
  if (!loaded) {
    return { title: "Program" };
  }
  return {
    title: `${loaded.program.title} — ${loaded.profileDisplayName}`,
    description: loaded.program.subtitle,
  };
}

/** Learner-facing program page — owners edit from `/manage`. */
export default async function ProgramPage({ params, searchParams }: PageProps) {
  const { username, programId } = await params;
  const { checkout } = await searchParams;
  const loaded = await loadProgramDetail(username, programId);

  if (!loaded) {
    notFound();
  }

  const { profileSlug, profileDisplayName, program: p, canManage } = loaded;
  const sessions = p.sessions;
  const hasSessions = sessions.length > 0;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hasAccess = await userHasProgramAccess({
    supabase,
    programId: p.id,
    priceValue: p.priceValue,
    canManage,
    userId: user?.id ?? null,
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <main className={`${pageMainStickyClass} space-y-10`}>
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/${profileSlug}`} className={navLinkClass}>
            ← {profileDisplayName}
          </Link>
          <div className="flex items-center gap-0.5">
            <ShareProgramButton
              urlPath={`/${profileSlug}/${programId}`}
              title={p.title}
            />
            {canManage ? (
              <EditProgramIconLink
                href={`/${profileSlug}/${programId}/manage`}
              />
            ) : null}
          </div>
        </nav>

        <div className="space-y-6 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-10 lg:space-y-0">
          <div className="space-y-6">
            <div className="space-y-3">
              <SectionHeader
                eyebrow="Program"
                title={p.title}
                subtitle={p.subtitle}
              />
            </div>

            {checkout === "success" && !hasAccess && !canManage ? (
              <p className="rounded-xl border border-stone-300 bg-stone-100 px-4 py-3 text-sm font-medium text-stone-900 dark:border-stone-700 dark:bg-stone-900/50 dark:text-stone-100">
                Payment received — access usually unlocks within a few seconds.
                Refresh if Begin doesn&apos;t appear yet.
              </p>
            ) : null}

            {checkout === "success" && hasAccess ? (
              <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                You&apos;re in — start the program when you&apos;re ready.
              </p>
            ) : null}

            {canManage && !p.isActive ? (
              <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                Only you can see this preview — users won&apos;t find this listing
                until visibility is on.{" "}
                <Link
                  href={`/${profileSlug}/${programId}/manage`}
                  className="font-semibold underline decoration-amber-600 underline-offset-2 dark:decoration-amber-400"
                >
                  Manage visibility
                </Link>
              </p>
            ) : null}
          </div>

          <div className="space-y-3 lg:pt-1">
            <p className={bodyEmphasisClass}>{p.price}</p>
            <ReadonlyTopicChips tags={p.topicTags} />
            {hasSessions ? (
              <p className={bodyLeadClass}>
                {sessions.length} session{sessions.length === 1 ? "" : "s"} —
                pick any tile below to start, or begin from the first session.
              </p>
            ) : null}
          </div>
        </div>

        <section className="space-y-5">
          <h2 className={titleSubsectionClass}>Sessions</h2>
          {hasSessions ? (
            <ProgramSessionGrid
              programId={p.id}
              profileSlug={profileSlug}
              sessions={sessions}
            />
          ) : canManage ? (
            <div className="max-w-xl space-y-4">
              <p className={bodyLeadClass}>
                No sessions yet. Add your first session so this program has
                something for people to open.
              </p>
              <Button
                href={`/${profileSlug}/${programId}/manage#sessions`}
                variant="outline"
                className="w-full min-h-10 justify-center px-5 text-sm font-medium sm:w-auto"
              >
                Add session
              </Button>
            </div>
          ) : (
            <p className={bodyLeadClass}>
              No sessions are published for this program yet.
            </p>
          )}
        </section>
      </main>

      {hasSessions && (p.isActive || canManage) ? (
        <BeginProgramCta
          profileSlug={profileSlug}
          programId={p.id}
          sessionIds={sessions.map((s) => s.id)}
          hasAccess={hasAccess}
          priceLabel={p.price}
          isSignedIn={Boolean(user)}
        />
      ) : null}
    </div>
  );
}
