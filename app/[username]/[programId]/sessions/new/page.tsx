import { loadProgramDetail } from "@/lib/program/load-program-detail";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ username: string; programId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username, programId } = await params;
  const loaded = await loadProgramDetail(username, programId);
  if (!loaded) {
    return { title: "Add session" };
  }
  return {
    title: `Add session — ${loaded.program.title}`,
    description: "Add a new session to your program.",
  };
}

/** Add session lives inline on manage — keep this route as a redirect. */
export default async function NewProgramSessionPage({ params }: PageProps) {
  const { username, programId } = await params;
  const loaded = await loadProgramDetail(username, programId);

  if (!loaded || !loaded.canManage) {
    notFound();
  }

  redirect(`/${loaded.profileSlug}/${programId}/manage#sessions`);
}
