import { parseGumletAssetId } from "@/lib/gumlet/asset-id";
import { getGumletApiKey, getGumletWorkspaceId } from "@/lib/gumlet/env";

const CHART_URL = "https://api.gumlet.com/v2/video/viewer-analytics";
const GUMLET_TIMEOUT_MS = 12_000;

export type InsightsDateRange = {
  startAt: string;
  endAt: string;
};

export type InsightsChartPoint = {
  at: number;
  value: number;
};

export type AssetInsights = {
  assetId: string;
  views: number;
  uniqueViews: number;
  playingTimeHours: number;
  viewsByWeek: InsightsChartPoint[];
};

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

async function postInsights(
  body: Record<string, unknown>,
): Promise<unknown> {
  const apiKey = getGumletApiKey();
  if (!apiKey) return null;

  try {
    const response = await fetch(CHART_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(GUMLET_TIMEOUT_MS),
      next: { revalidate: 15 * 60 },
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) return null;
    return payload;
  } catch {
    return null;
  }
}

export function lastDaysRange(days: number): InsightsDateRange {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(end.getUTCDate() - (days - 1));
  const isoDate = (date: Date) => date.toISOString().slice(0, 10);
  return { startAt: isoDate(start), endAt: isoDate(end) };
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

function sumPoints(points: InsightsChartPoint[]): number {
  return points.reduce((sum, point) => sum + point.value, 0);
}

function maxPoint(points: InsightsChartPoint[]): number {
  return points.reduce((max, point) => Math.max(max, point.value), 0);
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

function seriesByAsset(
  metricBlock: unknown,
  wanted: Set<string>,
): Map<string, InsightsChartPoint[]> {
  const byAsset = new Map<string, InsightsChartPoint[]>();
  if (!isRecord(metricBlock) || !isRecord(metricBlock.data)) return byAsset;

  for (const [sourceKey, rawPoints] of Object.entries(metricBlock.data)) {
    const assetId = assetIdFromSourceKey(sourceKey, wanted);
    if (!assetId || !wanted.has(assetId)) continue;
    const points = parseChartPoints(rawPoints);
    const existing = byAsset.get(assetId) ?? [];
    byAsset.set(assetId, existing.concat(points));
  }
  return byAsset;
}

/** One workspace chart call, then keep only this creator's assets. */
export async function fetchInsightsByAsset(
  assetIds: string[],
  range: InsightsDateRange,
): Promise<Map<string, AssetInsights>> {
  const workspaceId = getGumletWorkspaceId();
  const wanted = new Set(
    assetIds
      .map((id) => parseGumletAssetId(id))
      .filter((id): id is string => Boolean(id)),
  );
  const empty = new Map<string, AssetInsights>();
  if (!getGumletApiKey() || !workspaceId || wanted.size === 0) return empty;

  const payload = await postInsights({
    metrics: ["views", "unique_views", "playing_time"],
    workspace_id: workspaceId,
    date_range: { start_at: range.startAt, end_at: range.endAt },
    group_by: "weekly",
    chart_dimension: { group_by: [{ name: "video_source_url" }] },
  });
  if (!isRecord(payload) || !isRecord(payload.analytics_data)) return empty;

  const viewsByAsset = seriesByAsset(payload.analytics_data.views, wanted);
  const uniqueByAsset = seriesByAsset(
    payload.analytics_data.unique_views,
    wanted,
  );
  const timeByAsset = seriesByAsset(payload.analytics_data.playing_time, wanted);

  const result = new Map<string, AssetInsights>();
  for (const assetId of wanted) {
    const viewsByWeek = viewsByAsset.get(assetId) ?? [];
    result.set(assetId, {
      assetId,
      views: sumPoints(viewsByWeek),
      uniqueViews: maxPoint(uniqueByAsset.get(assetId) ?? []),
      playingTimeHours: sumPoints(timeByAsset.get(assetId) ?? []),
      viewsByWeek,
    });
  }
  return result;
}
