import { parseGumletAssetId } from "@/lib/gumlet/asset-id";
import { getGumletApiKey, getGumletWorkspaceId } from "@/lib/gumlet/env";

const AGGREGATED_URL = "https://api.gumlet.com/v2/insights/aggregated-data";
const CHART_URL = "https://api.gumlet.com/v2/video/viewer-analytics";

export type InsightsDateRange = {
  startAt: string;
  endAt: string;
};

export type InsightsTotals = {
  views: number;
  uniqueViews: number;
  playingTimeHours: number;
};

export type InsightsChartPoint = {
  at: number;
  value: number;
};

export type InsightsVideoSeries = {
  assetId: string;
  points: InsightsChartPoint[];
};

export type InsightsFilter = {
  name: "video_source_url";
  value: string;
  operator: "contains";
};

export function assetUrlFilter(assetId: string): InsightsFilter[] {
  return [{ name: "video_source_url", value: assetId, operator: "contains" }];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function metricNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function readAggregatedValue(
  payload: Record<string, unknown>,
  metric: string,
  fn: "sum" | "average",
): number | null {
  const block = payload[metric];
  if (!isRecord(block)) return null;
  const entry = block[fn];
  if (!isRecord(entry)) return null;
  if (entry.value == null || entry.value === "") return null;
  return metricNumber(entry.value);
}

async function postInsights(
  url: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  const apiKey = getGumletApiKey();
  if (!apiKey) return null;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) return null;
  return payload;
}

export function lastDaysRange(days: number): InsightsDateRange {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(end.getUTCDate() - (days - 1));
  const isoDate = (date: Date) => date.toISOString().slice(0, 10);
  return { startAt: isoDate(start), endAt: isoDate(end) };
}

export async function fetchInsightsTotals(
  filters: InsightsFilter[],
  range: InsightsDateRange,
): Promise<InsightsTotals | null> {
  const workspaceId = getGumletWorkspaceId();
  if (!getGumletApiKey() || !workspaceId) return null;

  const payload = await postInsights(AGGREGATED_URL, {
    aggregate: [
      { metric: "views", function: "sum" },
      { metric: "unique_views", function: "sum" },
      { metric: "playing_time", function: "sum" },
    ],
    workspace_id: workspaceId,
    timeframe: { start_at: range.startAt, end_at: range.endAt },
    ...(filters.length > 0 ? { filters } : {}),
  });
  if (!isRecord(payload)) return null;

  return {
    views: readAggregatedValue(payload, "views", "sum") ?? 0,
    uniqueViews: readAggregatedValue(payload, "unique_views", "sum") ?? 0,
    playingTimeHours: readAggregatedValue(payload, "playing_time", "sum") ?? 0,
  };
}

function bucketMidpoint(label: string): number | null {
  const match = label.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return null;
  const low = Number(match[1]);
  const high = Number(match[2]);
  if (!Number.isFinite(low) || !Number.isFinite(high)) return null;
  return (low + high) / 2;
}

function completionFromHistogram(rows: unknown): number | null {
  if (!Array.isArray(rows)) return null;
  let weighted = 0;
  let views = 0;
  for (const row of rows) {
    if (!isRecord(row)) continue;
    const label = typeof row.rowid === "string" ? row.rowid : "";
    const mid = bucketMidpoint(label);
    const bucketViews = metricNumber(row.views);
    if (mid == null || bucketViews <= 0) continue;
    weighted += mid * bucketViews;
    views += bucketViews;
  }
  if (views <= 0) return null;
  return weighted / views;
}

/** Histogram metric — Gumlet's aggregated `average` is always 0. */
export async function fetchInsightsCompletion(
  filters: InsightsFilter[],
  range: InsightsDateRange,
): Promise<number | null> {
  const workspaceId = getGumletWorkspaceId();
  if (!getGumletApiKey() || !workspaceId) return null;

  const payload = await postInsights(CHART_URL, {
    metrics: ["completion_percent_by_views"],
    workspace_id: workspaceId,
    date_range: { start_at: range.startAt, end_at: range.endAt },
    ...(filters.length > 0 ? { filters } : {}),
  });
  if (!isRecord(payload) || !isRecord(payload.analytics_data)) return null;
  return completionFromHistogram(payload.analytics_data.completion_percent_by_views);
}

function parseChartPoints(value: unknown): InsightsChartPoint[] {
  if (!Array.isArray(value)) return [];
  const points: InsightsChartPoint[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const at = metricNumber(item.x);
    if (at <= 0) continue;
    points.push({ at, value: metricNumber(item.y) });
  }
  return points;
}

function assetIdFromSourceKey(
  sourceKey: string,
  assetIds: Set<string>,
): string | null {
  const matches = sourceKey.toLowerCase().match(/[a-f0-9]{24}/g) ?? [];
  for (const id of matches) {
    if (assetIds.has(id)) return id;
  }
  return parseGumletAssetId(sourceKey);
}

export async function fetchInsightsViewsByAsset(
  assetIds: string[],
  range: InsightsDateRange,
): Promise<InsightsVideoSeries[]> {
  const workspaceId = getGumletWorkspaceId();
  const wanted = new Set(
    assetIds
      .map((id) => parseGumletAssetId(id))
      .filter((id): id is string => Boolean(id)),
  );
  if (!getGumletApiKey() || !workspaceId || wanted.size === 0) return [];

  const payload = await postInsights(CHART_URL, {
    metrics: ["views"],
    workspace_id: workspaceId,
    date_range: { start_at: range.startAt, end_at: range.endAt },
    group_by: "weekly",
    chart_dimension: { group_by: [{ name: "video_source_url" }] },
  });
  if (!isRecord(payload)) return [];

  const analytics = isRecord(payload.analytics_data)
    ? payload.analytics_data
    : null;
  const views = analytics ? analytics.views : null;
  if (!isRecord(views) || !isRecord(views.data)) return [];

  const series: InsightsVideoSeries[] = [];
  for (const [sourceKey, points] of Object.entries(views.data)) {
    const assetId = assetIdFromSourceKey(sourceKey, wanted);
    if (!assetId || !wanted.has(assetId)) continue;
    series.push({ assetId, points: parseChartPoints(points) });
  }
  return series;
}
