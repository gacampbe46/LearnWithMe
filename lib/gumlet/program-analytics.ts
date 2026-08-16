import { parseGumletAssetId } from "@/lib/gumlet/asset-id";
import type { AssetInsights, InsightsChartPoint } from "@/lib/gumlet/insights";

export const ANALYTICS_DAYS = 30;

export type ProgramAnalyticsSessionInput = {
  id: string;
  title: string;
  assetId: string | null;
};

export type ProgramSessionAnalytics = {
  sessionId: string;
  title: string;
  hasVideo: boolean;
  views: number;
  uniqueViews: number;
  playingTimeHours: number;
  completionPercent: number | null;
};

export type ProgramAnalyticsTrendPoint = {
  key: string;
  label: string;
  value: number;
};

export function weightedCompletion(
  sessions: ProgramSessionAnalytics[],
): number | null {
  let weighted = 0;
  let views = 0;
  for (const session of sessions) {
    if (session.completionPercent == null || session.views <= 0) continue;
    weighted += session.completionPercent * session.views;
    views += session.views;
  }
  if (views <= 0) return null;
  return weighted / views;
}

export function mergeWeeklyViews(
  series: InsightsChartPoint[][],
): ProgramAnalyticsTrendPoint[] {
  const byAt = new Map<number, number>();
  for (const points of series) {
    for (const point of points) {
      byAt.set(point.at, (byAt.get(point.at) ?? 0) + point.value);
    }
  }
  return [...byAt.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([at, value]) => {
      const date = new Date(at);
      return {
        key: String(at),
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
        value,
      };
    });
}

export function sessionAnalyticsFromInsights(
  session: ProgramAnalyticsSessionInput,
  byAsset: Map<string, AssetInsights>,
): ProgramSessionAnalytics {
  const assetId = parseGumletAssetId(session.assetId);
  const insights = assetId ? byAsset.get(assetId) : undefined;
  return {
    sessionId: session.id,
    title: session.title,
    hasVideo: Boolean(assetId),
    views: insights?.views ?? 0,
    uniqueViews: insights?.uniqueViews ?? 0,
    playingTimeHours: insights?.playingTimeHours ?? 0,
    completionPercent: null,
  };
}

export function formatWatchTime(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "0 min";
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes < 1) return "< 1 min";
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) return `${wholeHours} hr`;
  return `${wholeHours} hr ${minutes} min`;
}

export function formatCompletion(percent: number | null): string {
  if (percent == null || !Number.isFinite(percent)) return "—";
  return `${Math.round(percent)}%`;
}
