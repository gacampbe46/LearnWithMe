import { parseGumletAssetId } from "@/lib/gumlet/asset-id";
import { getGumletApiKey, getGumletWorkspaceId } from "@/lib/gumlet/env";
import {
  ANALYTICS_DAYS,
  loadProgramVideoAnalytics,
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

function mergeWeeklyViews(
  series: ProgramAnalyticsTrendPoint[][],
): ProgramAnalyticsTrendPoint[] {
  const byKey = new Map<string, ProgramAnalyticsTrendPoint>();
  for (const points of series) {
    for (const point of points) {
      const existing = byKey.get(point.key);
      if (existing) {
        existing.value += point.value;
      } else {
        byKey.set(point.key, { ...point });
      }
    }
  }
  return [...byKey.values()].sort((a, b) => Number(a.key) - Number(b.key));
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
  if (programs.length === 0) {
    return emptyCreatorAnalytics(
      Boolean(getGumletApiKey() && getGumletWorkspaceId()),
    );
  }

  const loaded = await Promise.all(
    programs.map(async (program) => {
      const analytics = await loadProgramVideoAnalytics(
        program.id,
        program.sessions,
      );
      return { program, analytics };
    }),
  );

  const configured = loaded.some((row) => row.analytics.configured);
  if (!configured) return emptyCreatorAnalytics(false);

  const rows: CreatorProgramAnalyticsRow[] = loaded.map(
    ({ program, analytics }) => ({
      programId: program.id,
      title: program.title,
      href: program.href,
      views: analytics.views,
      uniqueViews: analytics.uniqueViews,
      playingTimeHours: analytics.playingTimeHours,
      completionPercent: analytics.completionPercent,
      sessions: analytics.sessions,
    }),
  );

  const allSessions = rows.flatMap((row) => row.sessions);

  return {
    configured: true,
    rangeLabel: RANGE_LABEL,
    views: rows.reduce((sum, row) => sum + row.views, 0),
    uniqueViews: rows.reduce((sum, row) => sum + row.uniqueViews, 0),
    playingTimeHours: rows.reduce((sum, row) => sum + row.playingTimeHours, 0),
    completionPercent: weightedCompletion(allSessions),
    viewsByWeek: mergeWeeklyViews(loaded.map((row) => row.analytics.viewsByWeek)),
    programs: rows,
  };
}
