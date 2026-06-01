import { EditProgramIconLink } from "@/components/program/edit-program-icon-link";
import { ShareProgramButton } from "@/components/program/share-program-button";
import { ReadonlyTopicChips } from "@/components/program/ReadonlyTopicChips";
import { loadProgramDetail } from "@/lib/program/load-program-detail";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { VideoEmbed } from "@/components/VideoEmbed";
import { StickyBottomCTA } from "@/components/StickyBottomCTA";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  bodyLeadClass,
  metaCapsClass,
  navLinkClass,
  titleCardClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";

type PageProps = {
  params: Promise<{ username: string; programId: string }>;
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
export default async function ProgramPage({ params }: PageProps) {
  const { username, programId } = await params;
  const loaded = await loadProgramDetail(username, programId);

  if (!loaded) {
    notFound();
  }

  const { profileSlug, profileDisplayName, program: p, canManage } = loaded;
  const sessions = p.sessions;
  const firstSession = sessions[0];
  const hasSessions = sessions.length > 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 space-y-10 px-4 py-10 pb-28">
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

        <SectionHeader title={p.title} subtitle={p.subtitle} />

        {canManage && !p.isActive ? (
          <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            Hidden from learners — learners won&apos;t find this listing until it&apos;s
            active.{" "}
            <Link
              href={`/${profileSlug}/${programId}/manage`}
              className="font-semibold underline decoration-amber-600 underline-offset-2 dark:decoration-amber-400"
            >
              Manage visibility
            </Link>
          </p>
        ) : null}

        <ReadonlyTopicChips tags={p.topicTags} />

        <section className="space-y-8">
          <h2 className={titleSubsectionClass}>Sessions</h2>
          {hasSessions ? (
            <ul className="space-y-6">
              {sessions.map((s, index) => {
                const videoId = s.media[0]?.videoId?.trim() ?? "";
                const sessionHref = `/${profileSlug}/${p.id}/${s.id}`;
                const n = index + 1;
                const total = sessions.length;
                return (
                  <li key={s.id}>
                    <Card className="space-y-0 !p-0 overflow-hidden shadow-md shadow-zinc-900/[0.06] dark:shadow-black/25">
                      <div className="border-b border-zinc-200/80 bg-zinc-100/60 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900/80">
                        {total > 1 ? (
                          <p className={metaCapsClass}>
                            Session {n} of {total}
                          </p>
                        ) : null}
                        <h3
                          className={`${titleCardClass} ${total > 1 ? "mt-1" : ""}`}
                        >
                          {s.title}
                        </h3>
                      </div>
                      <div className="space-y-4 px-5 pb-5 pt-4">
                        {videoId ? (
                          <VideoEmbed videoId={videoId} title={s.title} />
                        ) : (
                          <div
                            className="flex aspect-video w-full items-center justify-center rounded-xl bg-zinc-200 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                            role="presentation"
                          >
                            No video for this session yet
                          </div>
                        )}
                        {s.description ? (
                          <p className={bodyLeadClass}>{s.description}</p>
                        ) : null}
                        <div className="flex flex-wrap justify-end gap-3 border-t border-zinc-200/80 pt-4 dark:border-zinc-700/80">
                          <Button
                            href={sessionHref}
                            variant="outline"
                            className="min-h-10 shrink-0 px-5 text-sm font-medium"
                          >
                            View session
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          ) : canManage ? (
            <div className="space-y-4">
              <p className={bodyLeadClass}>
                No sessions yet. Add your first session so this program has
                something for people to open.
              </p>
              <Button
                href={`/${profileSlug}/${programId}/sessions/new`}
                variant="outline"
                className="w-full min-h-10 justify-center px-5 text-sm font-medium"
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

      {hasSessions && firstSession && (p.isActive || canManage) ? (
        <StickyBottomCTA>
          <Button
            href={`/${profileSlug}/${p.id}/${firstSession.id}`}
            className="min-h-12 w-full max-w-sm"
          >
            Begin program
          </Button>
        </StickyBottomCTA>
      ) : null}
    </div>
  );
}
