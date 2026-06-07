import { listInterestTagOptions } from "@/lib/catalog/interest-tags";
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
import { pageMainStickyClass } from "@/lib/ui/page-layout";
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
      <main className={`${pageMainStickyClass} space-y-10`}>
        <nav>
          <Link href={`/${profileSlug}/${programId}`} className={navLinkClass}>
            ← View program page
          </Link>
        </nav>

        <header className="space-y-1 border-b border-editorial-border pb-4">
          <h1 className={titlePrimaryClass}>Manage program</h1>
          <p className={subtitleSmClass}>{p.title}</p>
        </header>

        {!p.isActive ? (
          <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            Hidden from learners — you can still preview the program page; learners
            won&apos;t see it on your profile until visibility is on.
          </p>
        ) : null}

        <div className="space-y-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-10 lg:space-y-0">
          <div className="space-y-10">
            <EditProgramPanel
              username={profileSlug}
              programId={programId}
              program={p}
              catalogTagOptions={catalog.options}
              catalogTagsLoadError={catalog.error}
            />

            <ManageProgramPanel
              username={profileSlug}
              programId={programId}
            />
          </div>

          <section className="space-y-4 lg:sticky lg:top-20">
            <h3 className={titleSubsectionClass}>Sessions</h3>
            <ManageSessionsList
              profileSlug={profileSlug}
              programId={programId}
              sessionsStamp={sessionsStamp}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
