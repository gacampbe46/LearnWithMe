import Link from "next/link";
import { notFound } from "next/navigation";
import { AddSessionForm } from "../../add-session-form";
import { SectionHeader } from "@/components/SectionHeader";
import { loadProgramDetail } from "@/lib/program/load-program-detail";
import { navLinkClass } from "@/lib/ui/typography";
import type { Metadata } from "next";

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

export default async function NewProgramSessionPage({ params }: PageProps) {
  const { username, programId } = await params;
  const loaded = await loadProgramDetail(username, programId);

  if (!loaded || !loaded.canManage) {
    notFound();
  }

  const { profileSlug, program: p } = loaded;
  const backHref = `/${profileSlug}/${programId}/manage`;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 space-y-8 px-4 py-10">
        <nav className="flex flex-wrap items-center gap-3">
          <Link href={backHref} className={navLinkClass}>
            ← Back to manage
          </Link>
        </nav>

        <SectionHeader
          title="Add session"
          subtitle={`You’re adding this to “${p.title}.” Saved sessions appear on your program page.`}
        />

        <AddSessionForm username={profileSlug} programId={programId} />
      </main>
    </div>
  );
}
