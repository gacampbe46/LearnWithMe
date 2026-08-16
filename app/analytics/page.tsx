import { CreatorAnalyticsPanel } from "@/components/analytics/creator-analytics-panel";
import { ANALYTICS_PATH } from "@/lib/app-paths";
import {
  loadCreatorVideoAnalytics,
  loadInstructorProgramsForAnalytics,
} from "@/lib/gumlet/creator-analytics";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTeachingProfile } from "@/lib/teach/teaching-profile";
import { pageMainClass } from "@/lib/ui/page-layout";
import { subtitleSmClass, titleDisplayClass } from "@/lib/ui/typography";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Analytics — learnwithme",
  description: "See how people watch your program videos.",
};

export default async function AnalyticsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(ANALYTICS_PATH)}`);
  }

  const profile = await getTeachingProfile(supabase, user.id);
  if (!profile) {
    redirect(`/onboarding?next=${encodeURIComponent(ANALYTICS_PATH)}`);
  }
  if (!profile.isInstructor) {
    redirect("/");
  }

  const programs = await loadInstructorProgramsForAnalytics(
    supabase,
    profile.id,
    profile.username,
  );
  const analytics = await loadCreatorVideoAnalytics(programs);

  return (
    <div className="flex min-h-dvh flex-col">
      <main className={`${pageMainClass} space-y-8`}>
        <header className="space-y-2">
          <h1 className={titleDisplayClass}>Analytics</h1>
          {!analytics.configured ? (
            <p className={subtitleSmClass}>
              Video analytics are not configured on this environment yet.
            </p>
          ) : null}
        </header>

        {analytics.configured ? (
          <CreatorAnalyticsPanel analytics={analytics} />
        ) : null}
      </main>
    </div>
  );
}
