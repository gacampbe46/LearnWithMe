import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateProgramSessionsAside } from "@/components/program/CreateProgramSessionsAside";
import { NEW_PROGRAM_PATH, PAYOUTS_PATH } from "@/lib/app-paths";
import { listInterestTagOptions } from "@/lib/catalog/interest-tags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTeachingProfile } from "@/lib/teach/teaching-profile";
import { pageFocusedColumnClass, pageMainStickyClass } from "@/lib/ui/page-layout";
import { subtitleSmClass, titlePrimaryClass } from "@/lib/ui/typography";
import { ProgramCreateForm } from "./program-create-form";

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
    redirect(`/login?next=${encodeURIComponent(NEW_PROGRAM_PATH)}`);
  }

  const profile = await getTeachingProfile(supabase, user.id);
  if (!profile) {
    redirect(`/onboarding?next=${encodeURIComponent(NEW_PROGRAM_PATH)}`);
  }

  const { options: catalogTags, error: catalogTagsError } =
    await listInterestTagOptions(supabase);

  return (
    <div className="flex min-h-dvh flex-col">
      <main className={`${pageMainStickyClass} space-y-10`}>
        <header className="space-y-1 border-b border-editorial-border pb-4">
          <h1 className={titlePrimaryClass}>Create program</h1>
          <p className={subtitleSmClass}>
            Set the basics here as a draft — you&apos;ll add sessions and publish
            from manage right after. Paid programs need{" "}
            <Link href={PAYOUTS_PATH} className="font-medium underline underline-offset-2">
              payouts
            </Link>{" "}
            set up before going live.
          </p>
        </header>

        <div
          className={
            profile.isInstructor
              ? "space-y-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-10 lg:space-y-0"
              : pageFocusedColumnClass
          }
        >
          <ProgramCreateForm
            profile={profile}
            catalogTags={catalogTags}
            catalogTagsLoadError={catalogTagsError}
          />

          {profile.isInstructor ? (
            <div className="lg:sticky lg:top-20">
              <CreateProgramSessionsAside />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
