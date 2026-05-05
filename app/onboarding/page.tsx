import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileSetupForm } from "./profile-setup-form";
import { oauthOnboardingSeed } from "@/lib/auth/oauth-user";
import { profileNeedsOnboarding } from "@/lib/auth/profile-onboarding";
import { listInterestTagOptions } from "@/lib/catalog/interest-tags";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { navLinkClass, sectionEyebrowClass, titleDisplayClass } from "@/lib/ui/typography";

export const metadata: Metadata = {
  title: "Set up your profile — learnwithme",
  description: "Choose your public username and finish creating your learnwithme profile.",
};

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function OnboardingPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const backToOnboarding = `/onboarding?next=${encodeURIComponent(nextPath)}`;
    redirect(`/login?next=${encodeURIComponent(backToOnboarding)}`);
  }

  const needs = await profileNeedsOnboarding(supabase);
  if (!needs) {
    redirect(nextPath);
  }

  const oauth = oauthOnboardingSeed(user);
  const { options: interestTags, error: tagsLoadError } =
    await listInterestTagOptions(supabase);

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
        <nav className="mb-8 sm:mb-10">
          <Link href="/" className={navLinkClass}>
            ← Home
          </Link>
        </nav>

        <div className="mb-8 space-y-3">
          <p className={sectionEyebrowClass}>learnwithme</p>
          <h1 className={titleDisplayClass}>Finish your profile</h1>
        </div>

        <ProfileSetupForm
          nextPath={nextPath}
          defaultFirstName={oauth.defaultFirstName}
          defaultLastName={oauth.defaultLastName}
          oauthAvatar={oauth.avatar}
          interestTags={interestTags}
          tagsLoadError={tagsLoadError}
        />
      </main>
    </div>
  );
}
