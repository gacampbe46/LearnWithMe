import {
  AnalyticsPageShell,
  CreatorAnalyticsFallback,
} from "@/components/analytics/creator-analytics-fallback";
import { CreatorAnalyticsPanel } from "@/components/analytics/creator-analytics-panel";
import { ANALYTICS_PATH } from "@/lib/app-paths";
import {
  loadCreatorVideoAnalytics,
  loadInstructorProgramsForAnalytics,
} from "@/lib/gumlet/creator-analytics";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTeachingProfile } from "@/lib/teach/teaching-profile";
import { subtitleSmClass } from "@/lib/ui/typography";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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

  return (
    <AnalyticsPageShell>
      <Suspense fallback={<CreatorAnalyticsFallback />}>
        <CreatorAnalyticsBody
          profileId={profile.id}
          username={profile.username}
        />
      </Suspense>
    </AnalyticsPageShell>
  );
}

async function CreatorAnalyticsBody({
  profileId,
  username,
}: {
  profileId: string;
  username: string;
}) {
  const supabase = await createSupabaseServerClient();
  const programs = await loadInstructorProgramsForAnalytics(
    supabase,
    profileId,
    username,
  );
  const analytics = await loadCreatorVideoAnalytics(programs);

  if (!analytics.configured) {
    return (
      <p className={subtitleSmClass}>
        Video analytics are not configured on this environment yet.
      </p>
    );
  }

  return <CreatorAnalyticsPanel analytics={analytics} />;
}
