import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateProgramSessionsAside } from "@/components/program/CreateProgramSessionsAside";
import { listInterestTagOptions } from "@/lib/catalog/interest-tags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTeachingProfile } from "@/lib/teach/teaching-profile";
import { pageMainStickyClass } from "@/lib/ui/page-layout";
import { navLinkClass, subtitleSmClass, titlePrimaryClass } from "@/lib/ui/typography";
import { ProgramCreateForm } from "./program-create-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a program — learnwithme",
  description: "Publish a structured program on your learnwithme profile.",
};

export default async function NewProgramPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/teach/programs/new")}`);
  }

  const profile = await getTeachingProfile(supabase, user.id);
  if (!profile) {
    redirect(`/onboarding?next=${encodeURIComponent("/teach/programs/new")}`);
  }

  const { options: catalogTags, error: catalogTagsError } =
    await listInterestTagOptions(supabase);

  return (
    <div className="flex min-h-dvh flex-col">
      <main className={`${pageMainStickyClass} space-y-10`}>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/" className={navLinkClass}>
            ← Home
          </Link>
          <Link href={`/${profile.username}`} className={navLinkClass}>
            Your profile
          </Link>
        </nav>

        <header className="space-y-1 border-b border-editorial-border pb-4">
          <h1 className={titlePrimaryClass}>Create program</h1>
          <p className={subtitleSmClass}>
            Set the basics and visibility, then add sessions on the right.
          </p>
        </header>

        <div className="space-y-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-10 lg:space-y-0">
          <ProgramCreateForm
            profile={profile}
            catalogTags={catalogTags}
            catalogTagsLoadError={catalogTagsError}
          />

          <div className="lg:sticky lg:top-20">
            <CreateProgramSessionsAside />
          </div>
        </div>
      </main>
    </div>
  );
}
