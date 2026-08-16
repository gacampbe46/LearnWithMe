import { parseGumletAssetId } from "@/lib/gumlet/asset-id";
import { getGumletApiKey, getGumletWorkspaceId } from "@/lib/gumlet/env";
import {
  fetchInsightsByAsset,
  lastDaysRange,
  type AssetInsights,
} from "@/lib/gumlet/insights";
import {
  ANALYTICS_DAYS,
  mergeWeeklyViews,
  sessionAnalyticsFromInsights,
  weightedCompletion,
  type ProgramAnalyticsSessionInput,
  type ProgramAnalyticsTrendPoint,
  type ProgramSessionAnalytics,
} from "@/lib/gumlet/program-analytics";
import type { SupabaseClient } from "@supabase/supabase-js";

const RANGE_LABEL = `Last ${ANALYTICS_DAYS} days`;

export type InstructorProgramAnalyticsInput = {
  id: string;
  title: string;
  href: string;
  sessions: ProgramAnalyticsSessionInput[];
};

export type CreatorProgramAnalyticsRow = {
  programId: string;
  title: string;
  href: string;
  views: number;
  uniqueViews: number;
  playingTimeHours: number;
  completionPercent: number | null;
  sessions: ProgramSessionAnalytics[];
};

export type CreatorVideoAnalytics = {
  configured: boolean;
  rangeLabel: string;
  views: number;
  uniqueViews: number;
  playingTimeHours: number;
  completionPercent: number | null;
  viewsByWeek: ProgramAnalyticsTrendPoint[];
  programs: CreatorProgramAnalyticsRow[];
};

type ProgramRow = {
  id: string;
  title: string | null;
  sessions:
    | {
        id: string;
        title: string | null;
        content_url: string | null;
        sort_order: number | null;
      }[]
    | null;
};

function sessionInputs(
  sessions: ProgramRow["sessions"],
): ProgramAnalyticsSessionInput[] {
  return [...(sessions ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((session) => ({
      id: session.id,
      title: session.title?.trim() || "Session",
      assetId: parseGumletAssetId(session.content_url),
    }));
}

function emptyCreatorAnalytics(configured: boolean): CreatorVideoAnalytics {
  return {
    configured,
    rangeLabel: RANGE_LABEL,
    views: 0,
    uniqueViews: 0,
    playingTimeHours: 0,
    completionPercent: null,
    viewsByWeek: [],
    programs: [],
  };
}

function rollupSessions(
  program: InstructorProgramAnalyticsInput,
  byAsset: Map<string, AssetInsights>,
): CreatorProgramAnalyticsRow {
  const sessions = program.sessions.map((session) =>
    sessionAnalyticsFromInsights(session, byAsset),
  );
  return {
    programId: program.id,
    title: program.title,
    href: program.href,
    views: sessions.reduce((sum, row) => sum + row.views, 0),
    uniqueViews: sessions.reduce((sum, row) => sum + row.uniqueViews, 0),
    playingTimeHours: sessions.reduce(
      (sum, row) => sum + row.playingTimeHours,
      0,
    ),
    completionPercent: weightedCompletion(sessions),
    sessions,
  };
}

export async function loadInstructorProgramsForAnalytics(
  supabase: SupabaseClient,
  profileId: string,
  username: string,
): Promise<InstructorProgramAnalyticsInput[]> {
  const { data, error } = await supabase
    .from("programs")
    .select("id, title, created_at, sessions(id, title, content_url, sort_order)")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as ProgramRow[]).map((row) => ({
    id: row.id,
    title: row.title?.trim() || "Program",
    href: `/${username}/${row.id}`,
    sessions: sessionInputs(row.sessions),
  }));
}

export async function loadCreatorVideoAnalytics(
  programs: InstructorProgramAnalyticsInput[],
): Promise<CreatorVideoAnalytics> {
  const configured = Boolean(getGumletApiKey() && getGumletWorkspaceId());
  if (!configured) return emptyCreatorAnalytics(false);
  if (programs.length === 0) return emptyCreatorAnalytics(true);

  const assetIds = programs.flatMap((program) =>
    program.sessions
      .map((session) => parseGumletAssetId(session.assetId))
      .filter((id): id is string => Boolean(id)),
  );

  const byAsset = await fetchInsightsByAsset(
    assetIds,
    lastDaysRange(ANALYTICS_DAYS),
  );

  const rows = programs.map((program) => rollupSessions(program, byAsset));
  const allSessions = rows.flatMap((row) => row.sessions);

  return {
    configured: true,
    rangeLabel: RANGE_LABEL,
    views: rows.reduce((sum, row) => sum + row.views, 0),
    uniqueViews: rows.reduce((sum, row) => sum + row.uniqueViews, 0),
    playingTimeHours: rows.reduce((sum, row) => sum + row.playingTimeHours, 0),
    completionPercent: weightedCompletion(allSessions),
    viewsByWeek: mergeWeeklyViews(
      [...byAsset.values()].map((insights) => insights.viewsByWeek),
    ),
    programs: rows,
  };
}
