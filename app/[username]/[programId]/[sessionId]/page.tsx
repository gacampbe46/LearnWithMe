import { SessionMediaCard } from "@/components/SessionMediaCard";
import { SessionNotesField } from "@/components/session-notes-field";
import { SessionStickyNav } from "@/components/SessionStickyNav";
import { EditProgramIconLink } from "@/components/program/edit-program-icon-link";
import { memberProgramSessionById } from "@/lib/member";
import { loadProgramDetail } from "@/lib/program/load-program-detail";
import { userHasProgramAccess } from "@/lib/stripe/entitlements";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pageMainSessionClass } from "@/lib/ui/page-layout";
import {
  bodyLeadClass,
  navLinkClass,
  sectionEyebrowClass,
  titlePrimaryClass,
} from "@/lib/ui/typography";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ username: string; programId: string; sessionId: string }>;
};

export const dynamic = "force-dynamic";

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

  if (!hasAccess) {
    redirect(`/${profileSlug}/${programId}`);
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
  const sessionNumber = sessionIndex >= 0 ? sessionIndex + 1 : null;
  const sessionTotal = p.sessions.length;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className={pageMainSessionClass}>
        <div className="mx-auto w-full max-w-3xl space-y-8">
          <nav className="flex items-center justify-between gap-3">
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

          <header className="space-y-2">
            {sessionNumber != null && sessionTotal > 1 ? (
              <p className={sectionEyebrowClass}>
                Session {sessionNumber} of {sessionTotal}
              </p>
            ) : (
              <p className={sectionEyebrowClass}>Session</p>
            )}
            <h1 className={titlePrimaryClass}>{session.title}</h1>
            {session.description.trim() ? (
              <p className={bodyLeadClass}>{session.description}</p>
            ) : null}
          </header>

          <div className="space-y-10">
            {session.media.map((block) => (
              <SessionMediaCard
                key={block.id}
                block={block}
                showBlockTitle={false}
                programId={p.id}
              />
            ))}
            <SessionNotesField programId={p.id} sessionId={sessionId} />
          </div>
        </div>
      </main>

      <SessionStickyNav
        programId={p.id}
        sessionId={sessionId}
        mediaAnchorIds={mediaAnchorIds}
        finishHref={finishHref}
        nextSessionHref={nextSessionHref}
      />
    </div>
  );
}
