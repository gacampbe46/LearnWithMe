import { SessionMediaCard } from "@/components/SessionMediaCard";
import { SessionStickyNav } from "@/components/SessionStickyNav";
import { SectionHeader } from "@/components/SectionHeader";
import { EditProgramIconLink } from "@/components/edit-program-icon-link";
import { memberProgramSessionById } from "@/data/member";
import { loadProgramDetail } from "@/lib/program/load-program-detail";
import { navLinkClass } from "@/lib/ui/typography";
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
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 pb-32">
        <div className="space-y-16">
          <nav className="flex flex-wrap items-center justify-between gap-3">
            <Link href={finishHref} className={navLinkClass}>
              ← {p.title}
            </Link>
            {canManage ? (
              <EditProgramIconLink
                href={`/${profileSlug}/${programId}/sessions/${sessionId}/edit`}
                ariaLabel="Edit session"
                titleProp="Edit session"
              />
            ) : null}
          </nav>

          <SectionHeader title={session.title} subtitle={session.description} />

          <div className="space-y-20">
            {session.media.map((block) => (
              <SessionMediaCard
                key={block.id}
                block={block}
                showBlockTitle={false}
              />
            ))}
          </div>
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
