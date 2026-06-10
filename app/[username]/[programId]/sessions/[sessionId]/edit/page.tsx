import { memberProgramSessionById } from "@/lib/member";
import { loadProgramDetail } from "@/lib/program/load-program-detail";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

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

/** Edit session lives inline on manage — keep this route as a redirect. */
export default async function EditProgramSessionPage({ params }: PageProps) {
  const { username, programId, sessionId } = await params;
  const loaded = await loadProgramDetail(username, programId);

  if (!loaded || !loaded.canManage) {
    notFound();
  }

  const session = memberProgramSessionById(loaded.program, sessionId);
  if (!session) {
    notFound();
  }

  redirect(
    `/${loaded.profileSlug}/${programId}/manage#edit-${encodeURIComponent(sessionId)}`,
  );
}
