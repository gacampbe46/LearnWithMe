import { createClient } from "@supabase/supabase-js";
import type {
  Exercise,
  FeaturedPreviewVideo,
  MemberProfile,
  ProfileHubLink,
  ProfileViewPreference,
  Workout,
} from "./member";

type DbSession = {
  id: string;
  title: string | null;
  description: string | null;
  instructions: string | null;
  content_url: string | null;
  sort_order: number | null;
};

type DbProgram = {
  id: string;
  title: string | null;
  description: string | null;
  price: number | null;
  sessions: DbSession[] | null;
};

type DbProfile = {
  id: string;
  username: string | null;
  bio: string | null;
  first_name: string | null;
  last_name: string | null;
  tags: unknown;
  links: unknown;
  programs: DbProgram[] | null;
};

type ProfileTags = {
  tagline?: string;
  profileViewPreference?: ProfileViewPreference;
  /** Tag catalog UUIDs from `tags`, stored in profile.tags JSON. */
  tagIds?: string[];
  whatYouNeed?: string[];
  featuredPreviewVideos?: FeaturedPreviewVideo[];
  channelUrl?: string;
};

type ProfileLinks = {
  channelUrl?: string;
  hubLinks?: ProfileHubLink[];
};

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseProfileTags(value: unknown): ProfileTags {
  if (!isRecord(value)) return {};
  const maybeView = value.profileViewPreference;
  const profileViewPreference: ProfileViewPreference | undefined =
    maybeView === "link_hub" || maybeView === "full_content" || maybeView === "device_adaptive"
      ? maybeView
      : undefined;
  return {
    tagline: typeof value.tagline === "string" ? value.tagline : undefined,
    profileViewPreference,
    tagIds: Array.isArray(value.tagIds)
      ? value.tagIds.filter((x): x is string => typeof x === "string")
      : undefined,
    whatYouNeed: Array.isArray(value.whatYouNeed)
      ? value.whatYouNeed.filter((x): x is string => typeof x === "string")
      : undefined,
    featuredPreviewVideos: Array.isArray(value.featuredPreviewVideos)
      ? value.featuredPreviewVideos.filter(
          (v): v is FeaturedPreviewVideo =>
            isRecord(v) && typeof v.videoId === "string" && typeof v.title === "string",
        )
      : undefined,
    channelUrl: typeof value.channelUrl === "string" ? value.channelUrl : undefined,
  };
}

function parseProfileLinks(value: unknown): ProfileLinks {
  if (!isRecord(value)) return {};
  return {
    channelUrl: typeof value.channelUrl === "string" ? value.channelUrl : undefined,
    hubLinks: Array.isArray(value.hubLinks)
      ? value.hubLinks.filter(
          (v): v is ProfileHubLink =>
            isRecord(v) &&
            typeof v.label === "string" &&
            typeof v.href === "string" &&
            (v.external === undefined || typeof v.external === "boolean"),
        )
      : undefined,
  };
}

function normalizeYouTubeId(contentUrl: string | null): string {
  if (!contentUrl) return "";

  if (!contentUrl.includes("http")) {
    return contentUrl;
  }

  try {
    const url = new URL(contentUrl);
    const v = url.searchParams.get("v");
    if (v) return v;
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? contentUrl;
  } catch {
    return contentUrl;
  }
}

function formatPrice(price: number | null): string {
  if (typeof price !== "number" || Number.isNaN(price)) {
    return "Contact for pricing";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price);
}

function mapSessionToWorkout(session: DbSession): Workout {
  const exercise: Exercise = {
    id: `${session.id}-video`,
    title: session.title ?? "Session video",
    videoId: normalizeYouTubeId(session.content_url),
    setsReps: session.instructions ?? "Full session — follow along in the video",
    notes: [],
  };

  return {
    id: session.id,
    title: session.title ?? "Session",
    description: session.description ?? "",
    exercises: [exercise],
  };
}

function mapProfileToMember(profile: DbProfile): MemberProfile | undefined {
  const username = profile.username ?? undefined;
  if (!username) return undefined;

  const tags = parseProfileTags(profile.tags);
  const links = parseProfileLinks(profile.links);
  const dbProgram = profile.programs?.[0];

  const firstName = profile.first_name?.trim() ?? "";
  const lastName = profile.last_name?.trim() ?? "";
  const displayName = `${firstName} ${lastName}`.trim() || username;

  const program =
    dbProgram != null
      ? (() => {
          const sortedSessions = [...(dbProgram.sessions ?? [])].sort(
            (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
          );
          return {
            id: dbProgram.id,
            title: dbProgram.title ?? "Program",
            subtitle: dbProgram.description ?? "",
            price: formatPrice(dbProgram.price),
            workouts: sortedSessions.map(mapSessionToWorkout),
          };
        })()
      : undefined;

  return {
    id: profile.id,
    name: displayName,
    slug: username,
    bio: profile.bio ?? "",
    tagline: tags.tagline ?? profile.bio ?? "",
    channelUrl: links.channelUrl ?? tags.channelUrl ?? "",
    profileViewPreference: tags.profileViewPreference ?? "full_content",
    hubLinks: links.hubLinks,
    whatYouNeed: tags.whatYouNeed ?? [],
    featuredPreviewVideos: tags.featuredPreviewVideos ?? [],
    ...(program ? { program } : {}),
  };
}

export async function getMemberByUsername(username: string): Promise<MemberProfile | undefined> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase
    .from("profile")
    .select(
      "id, username, bio, first_name, last_name, tags, links, programs(id, title, description, price, sessions(id, title, description, instructions, content_url, sort_order))",
    )
    .eq("username", username)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return mapProfileToMember(data as DbProfile);
}
