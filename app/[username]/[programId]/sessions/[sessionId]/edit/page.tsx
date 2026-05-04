import Link from "next/link";
import { notFound } from "next/navigation";
import { EditSessionForm } from "../../../edit-session-form";
import { SectionHeader } from "@/components/SectionHeader";
import { memberProgramSessionById } from "@/data/member";
import { loadProgramDetail } from "@/lib/program/load-program-detail";
import { navLinkClass } from "@/lib/ui/typography";
import type { Metadata } from "next";

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
    return { title: "Edit session" };
  }
  return {
    title: `Edit session — ${session.title}`,
    description: `Update "${session.title}" in ${loaded.program.title}.`,
  };
}

export default async function EditProgramSessionPage({ params }: PageProps) {
  const { username, programId, sessionId } = await params;
  const loaded = await loadProgramDetail(username, programId);

  if (!loaded || !loaded.canManage) {
    notFound();
  }

  const { profileSlug, program: p } = loaded;
  const session = memberProgramSessionById(p, sessionId);
  if (!session) {
    notFound();
  }

  const backManage = `/${profileSlug}/${programId}/manage`;
  const initialVideo =
    session.storedContentUrl ?? session.media[0]?.videoId ?? "";

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 space-y-8 px-4 py-10">
        <nav className="flex flex-wrap items-center gap-3">
          <Link href={backManage} className={navLinkClass}>
            ← Back to manage
          </Link>
        </nav>

        <SectionHeader
          title="Edit session"
          subtitle={`Update “${session.title}” in “${p.title}.”`}
        />

        <EditSessionForm
          username={profileSlug}
          programId={programId}
          sessionId={sessionId}
          initialTitle={session.title}
          initialDescription={session.description}
          initialVideoInput={initialVideo}
        />
      </main>
    </div>
  );
}
