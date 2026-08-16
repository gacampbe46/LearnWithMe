import {
  AnalyticsPageShell,
  CreatorAnalyticsFallback,
} from "@/components/analytics/creator-analytics-fallback";

export default function AnalyticsLoading() {
  return (
    <AnalyticsPageShell>
      <CreatorAnalyticsFallback />
    </AnalyticsPageShell>
  );
}
