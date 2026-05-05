import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { listInterestTagOptions } from "@/lib/catalog/interest-tags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTeachingProfile } from "@/lib/teach/teaching-profile";
import { navLinkClass } from "@/lib/ui/typography";
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
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10">
        <div className="space-y-10">
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/" className={navLinkClass}>
              ← Home
            </Link>
            <Link href={`/${profile.username}`} className={navLinkClass}>
              Your profile
            </Link>
          </nav>

          <SectionHeader
            title="Offer a program"
            subtitle="Set the basics here, then open the program to add sessions."
          />

          <ProgramCreateForm
            profile={profile}
            catalogTags={catalogTags}
            catalogTagsLoadError={catalogTagsError}
          />

          <div className="text-center">
            <Button href="/conduct" variant="ghost" className="text-sm">
              Code of conduct
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
