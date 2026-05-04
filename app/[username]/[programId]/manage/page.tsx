import { listInterestTagOptions } from "@/lib/data/interest-tags";
import { loadProgramDetail } from "@/lib/program/load-program-detail";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ManageSessionsList } from "@/components/program/manage-sessions-list";
import {
  navLinkClass,
  subtitleSmClass,
  titlePrimaryClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";
import { EditProgramPanel } from "../edit-program-panel";
import { ManageProgramPanel } from "../manage-program-panel";

type PageProps = {
  params: Promise<{ username: string; programId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username, programId } = await params;
  const loaded = await loadProgramDetail(username, programId);
  if (!loaded) {
    return { title: "Manage program" };
  }
  return {
    title: `Manage — ${loaded.program.title}`,
    description: loaded.program.subtitle,
  };
}

export default async function ManageProgramPage({ params }: PageProps) {
  const { username, programId } = await params;
  const loaded = await loadProgramDetail(username, programId);

  if (!loaded) {
    notFound();
  }

  const { profileSlug, program: p, canManage } = loaded;

  if (!canManage) {
    redirect(`/${loaded.profileSlug}/${programId}`);
  }

  const sessions = p.sessions;
  const sessionsStamp = JSON.stringify(
    sessions.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description ?? "",
    })),
  );

  const supabase = await createSupabaseServerClient();
  const catalog = await listInterestTagOptions(supabase);

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 space-y-10 px-4 py-10 pb-28">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/${profileSlug}/${programId}`} className={navLinkClass}>
            ← View program page
          </Link>
          <Link href={`/${profileSlug}`} className={navLinkClass}>
            Profile
          </Link>
        </nav>

        <header className="space-y-1 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <h1 className={titlePrimaryClass}>Manage program</h1>
          <p className={subtitleSmClass}>{p.title}</p>
        </header>

        {!p.isActive ? (
          <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            Hidden from learners — only you see the public-facing view until this
            is active again.
          </p>
        ) : null}

        <EditProgramPanel
          username={profileSlug}
          programId={programId}
          program={p}
          catalogTagOptions={catalog.options}
          catalogTagsLoadError={catalog.error}
        />

        <section className="space-y-4">
          <h3 className={titleSubsectionClass}>Sessions</h3>
          <ManageSessionsList
            profileSlug={profileSlug}
            programId={programId}
            sessionsStamp={sessionsStamp}
          />
        </section>

        <ManageProgramPanel
          username={profileSlug}
          programId={programId}
          isActive={p.isActive}
        />
      </main>
    </div>
  );
}
