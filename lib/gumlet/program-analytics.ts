import { unstable_cache } from "next/cache";
import { parseGumletAssetId } from "@/lib/gumlet/asset-id";
import { getGumletApiKey, getGumletWorkspaceId } from "@/lib/gumlet/env";
import {
  assetUrlFilter,
  fetchInsightsCompletion,
  fetchInsightsTotals,
  fetchInsightsViewsByAsset,
  lastDaysRange,
  type InsightsChartPoint,
  type InsightsTotals,
} from "@/lib/gumlet/insights";

export const ANALYTICS_DAYS = 30;
const CACHE_SECONDS = 15 * 60;
const INSIGHTS_CONCURRENCY = 5;

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

export type ProgramVideoAnalytics = {
  configured: boolean;
  rangeLabel: string;
  views: number;
  uniqueViews: number;
  playingTimeHours: number;
  completionPercent: number | null;
  sessions: ProgramSessionAnalytics[];
  viewsByWeek: ProgramAnalyticsTrendPoint[];
};

function emptyAnalytics(configured: boolean): ProgramVideoAnalytics {
  return {
    configured,
    rangeLabel: `Last ${ANALYTICS_DAYS} days`,
    views: 0,
    uniqueViews: 0,
    playingTimeHours: 0,
    completionPercent: null,
    sessions: [],
    viewsByWeek: [],
  };
}

function emptyTotals(): InsightsTotals {
  return {
    views: 0,
    uniqueViews: 0,
    playingTimeHours: 0,
  };
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await mapper(items[index]);
    }
  }
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

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

function mergeWeeklyViews(
  series: { points: InsightsChartPoint[] }[],
): ProgramAnalyticsTrendPoint[] {
  const byAt = new Map<number, number>();
  for (const row of series) {
    for (const point of row.points) {
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

async function loadProgramVideoAnalyticsUncached(
  programId: string,
  sessions: ProgramAnalyticsSessionInput[],
): Promise<ProgramVideoAnalytics> {
  const configured = Boolean(getGumletApiKey() && getGumletWorkspaceId());
  if (!configured || !programId.trim()) return emptyAnalytics(configured);

  const range = lastDaysRange(ANALYTICS_DAYS);
  const assetIds = sessions
    .map((session) => parseGumletAssetId(session.assetId))
    .filter((id): id is string => Boolean(id));

  const [sessionTotals, weeklySeries] = await Promise.all([
    mapPool(sessions, INSIGHTS_CONCURRENCY, async (session) => {
      const assetId = parseGumletAssetId(session.assetId);
      const [totals, completionPercent] = assetId
        ? await Promise.all([
            fetchInsightsTotals(assetUrlFilter(assetId), range),
            fetchInsightsCompletion(assetUrlFilter(assetId), range),
          ])
        : [emptyTotals(), null];
      const row: ProgramSessionAnalytics = {
        sessionId: session.id,
        title: session.title,
        hasVideo: Boolean(assetId),
        views: totals?.views ?? 0,
        uniqueViews: totals?.uniqueViews ?? 0,
        playingTimeHours: totals?.playingTimeHours ?? 0,
        completionPercent,
      };
      return row;
    }),
    fetchInsightsViewsByAsset(assetIds, range),
  ]);

  const views = sessionTotals.reduce((sum, row) => sum + row.views, 0);
  const uniqueViews = sessionTotals.reduce(
    (sum, row) => sum + row.uniqueViews,
    0,
  );
  const playingTimeHours = sessionTotals.reduce(
    (sum, row) => sum + row.playingTimeHours,
    0,
  );

  return {
    configured: true,
    rangeLabel: `Last ${ANALYTICS_DAYS} days`,
    views,
    uniqueViews,
    playingTimeHours,
    completionPercent: weightedCompletion(sessionTotals),
    sessions: sessionTotals,
    viewsByWeek: mergeWeeklyViews(weeklySeries),
  };
}

export const loadProgramVideoAnalytics = unstable_cache(
  loadProgramVideoAnalyticsUncached,
  ["gumlet-program-video-analytics-v2"],
  { revalidate: CACHE_SECONDS, tags: ["gumlet-insights"] },
);

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
