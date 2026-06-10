import { SessionMediaCard } from "@/components/SessionMediaCard";
import { SessionStickyNav } from "@/components/SessionStickyNav";
import { SectionHeader } from "@/components/SectionHeader";
import { EditProgramIconLink } from "@/components/program/edit-program-icon-link";
import { ProgramSessionCard } from "@/components/program/ProgramSessionCard";
import { memberProgramSessionById } from "@/lib/member";
import { loadProgramDetail } from "@/lib/program/load-program-detail";
import { pageMainSessionClass, sessionGridClass } from "@/lib/ui/page-layout";
import { navLinkClass, titleSubsectionClass } from "@/lib/ui/typography";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ username: string; programId: string; sessionId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username, programId, sessionId } = await params;
  const loaded = await loadProgramDetail(username, programId);
  const session =
    loaded?.program && memberProgramSessionById(loaded.program, sessionId);

  if (!loaded || !session) {
    return { title: "Session" };
  }

  return {
    title: `${session.title} — ${loaded.profileDisplayName}`,
    description: session.description,
  };
}

export default async function ProgramSessionPage({ params }: PageProps) {
  const { username, programId, sessionId } = await params;
  const loaded = await loadProgramDetail(username, programId);

  if (!loaded) {
    notFound();
  }

  const { profileSlug, program: p, canManage } = loaded;

  const session = memberProgramSessionById(p, sessionId);

  if (!session) {
    notFound();
  }

  if (!p.isActive && !canManage) {
    notFound();
  }

  const mediaAnchorIds = session.media.map((m) => m.id);
  const finishHref = `/${profileSlug}/${p.id}`;
  const sessionIndex = p.sessions.findIndex((s) => s.id === sessionId);
  const nextInProgram =
    sessionIndex >= 0 && sessionIndex < p.sessions.length - 1
      ? p.sessions[sessionIndex + 1]
      : null;
  const nextSessionHref = nextInProgram
    ? `/${profileSlug}/${p.id}/${nextInProgram.id}`
    : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className={pageMainSessionClass}>
        <div className="space-y-16">
          <nav className="flex flex-wrap items-center justify-between gap-3">
            <Link href={finishHref} className={navLinkClass}>
              ← {p.title}
            </Link>
            {canManage ? (
              <EditProgramIconLink
                href={`/${profileSlug}/${programId}/manage#edit-${encodeURIComponent(sessionId)}`}
                ariaLabel="Edit session"
                titleProp="Edit session"
              />
            ) : null}
          </nav>

          <SectionHeader title={session.title} subtitle={session.description} />

          <div className="space-y-20 lg:max-w-4xl">
            {session.media.map((block) => (
              <SessionMediaCard
                key={block.id}
                block={block}
                showBlockTitle={false}
              />
            ))}
          </div>

          {p.sessions.length > 1 ? (
            <section className="space-y-5 border-t border-editorial-border pt-12">
              <h2 className={titleSubsectionClass}>More in this program</h2>
              <ul className={sessionGridClass}>
                {p.sessions.map((s, index) => {
                  if (s.id === sessionId) return null;
                  return (
                    <li key={s.id} className="min-w-0">
                      <ProgramSessionCard
                        session={s}
                        href={`/${profileSlug}/${p.id}/${s.id}`}
                        sessionNumber={index + 1}
                        sessionTotal={p.sessions.length}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      </main>

      <SessionStickyNav
        mediaAnchorIds={mediaAnchorIds}
        finishHref={finishHref}
        nextSessionHref={nextSessionHref}
      />
    </div>
  );
}
