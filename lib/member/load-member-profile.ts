import { createClient } from "@supabase/supabase-js";
import { fetchCatalogTagLabelMap } from "@/lib/program/catalog-tag-labels";
import {
  PROGRAM_CHILDREN_EMBED_FIELDS,
  PROGRAM_CHILDREN_EMBED_NO_TAGS,
} from "@/lib/program/program-embed-select";
import { parseProgramTagsColumn } from "@/lib/program/program-tags-json";
import type {
  FeaturedPreviewVideo,
  MemberProfile,
  Program,
  ProgramSession,
  ProgramTopicTag,
  ProfileHubLink,
  ProfileViewPreference,
  SessionMedia,
} from "./types";

type DbSession = {
  id: string;
  title: string | null;
  description: string | null;
  instructions: string | null;
  content_url: string | null;
  sort_order: number | null;
};

export type EmbeddedProgramRow = {
  id: string;
  title: string | null;
  description: string | null;
  price: number | null;
  created_at?: string | null;
  is_active?: boolean | null;
  profile_id?: string | null;
  sessions: DbSession[] | null;
  /** Catalog tag IDs JSON (`{ tagIds }`) on the `programs` row. */
  tags?: unknown;
};

type DbProgram = EmbeddedProgramRow;

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
  if (price === 0) {
    return "Free";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price);
}

function mapDbSessionToProgramSession(session: DbSession): ProgramSession {
  const block: SessionMedia = {
    id: `${session.id}-video`,
    title: session.title ?? "Video",
    videoId: normalizeYouTubeId(session.content_url),
    caption: session.instructions?.trim() ?? "",
    notes: [],
  };

  const rawUrl =
    typeof session.content_url === "string" && session.content_url.trim()
      ? session.content_url.trim()
      : null;

  return {
    id: session.id,
    title: session.title ?? "Session",
    description: session.description ?? "",
    media: [block],
    storedContentUrl: rawUrl,
  };
}

/** Map nested `programs` row from Supabase (profile embed or standalone select). */
export function mapEmbeddedProgramRow(
  dbProgram: EmbeddedProgramRow,
  catalogLabelById: Map<string, string>,
): Program {
  const sortedSessions = [...(dbProgram.sessions ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
  const tagIds = parseProgramTagsColumn(dbProgram.tags);
  const topicTags: ProgramTopicTag[] = tagIds
    .map((id) => {
      const label = catalogLabelById.get(id);
      const name =
        label ??
        (id.length > 12 ? `${id.slice(0, 8)}…` : id);
      return { id, name };
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  const isActive = dbProgram.is_active !== false;

  const rawPrice = dbProgram.price;
  const priceValue =
    typeof rawPrice === "number" && Number.isFinite(rawPrice) ? rawPrice : null;

  return {
    id: dbProgram.id,
    title: dbProgram.title ?? "Program",
    subtitle: dbProgram.description ?? "",
    price: formatPrice(rawPrice),
    priceValue,
    sessions: sortedSessions.map(mapDbSessionToProgramSession),
    topicTags,
    isActive,
  };
}

function mapProfileToMember(
  profile: DbProfile,
  catalogLabelById: Map<string, string>,
): MemberProfile | undefined {
  const username = profile.username ?? undefined;
  if (!username) return undefined;

  const tags = parseProfileTags(profile.tags);
  const links = parseProfileLinks(profile.links);

  const firstName = profile.first_name?.trim() ?? "";
  const lastName = profile.last_name?.trim() ?? "";
  const displayName = `${firstName} ${lastName}`.trim() || username;

  const rawPrograms = profile.programs ?? [];
  const programsSortedNewestFirst = [...rawPrograms]
    .filter((row) => row.is_active !== false)
    .sort((a, b) => {
      const ta = a.created_at ? Date.parse(a.created_at) : 0;
      const tb = b.created_at ? Date.parse(b.created_at) : 0;
      if (tb !== ta) return tb - ta;
      return a.id.localeCompare(b.id);
    });
  const programs = programsSortedNewestFirst.map((row) =>
    mapEmbeddedProgramRow(row as EmbeddedProgramRow, catalogLabelById),
  );
  const program = programs[0];

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
    programs,
    ...(program ? { program } : {}),
  };
}

export async function getMemberByUsername(username: string): Promise<MemberProfile | undefined> {
  const client = getSupabaseClient();
  if (!client) {
    return undefined;
  }

  const normalized = username.trim().toLowerCase();

  async function fetchWithProgramEmbed(
    sb: NonNullable<typeof client>,
    embed: string,
  ): Promise<{
    data: unknown;
    error: { message?: string } | null;
  }> {
    const profileSelect =
      "id, username, bio, first_name, last_name, tags, links, programs(" +
      embed +
      ")";
    return sb
      .from("profile")
      .select(profileSelect)
      .eq("username", normalized)
      .limit(1)
      .maybeSingle();
  }

  let { data, error } = await fetchWithProgramEmbed(
    client,
    PROGRAM_CHILDREN_EMBED_FIELDS,
  );

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[getMemberByUsername] profile embed with tags failed, retrying without program tags:",
        error.message ?? error,
      );
    }
    const second = await fetchWithProgramEmbed(client, PROGRAM_CHILDREN_EMBED_NO_TAGS);
    data = second.data;
    error = second.error;
  }

  if (error || !data) {
    if (process.env.NODE_ENV === "development" && error) {
      console.warn("[getMemberByUsername]", normalized, error.message ?? error);
    }
    return undefined;
  }

  const dbProfile = data as unknown as DbProfile;
  const rawPrograms = dbProfile.programs ?? [];
  const allTagIds: string[] = [];
  for (const row of rawPrograms) {
    const r = row as EmbeddedProgramRow | undefined;
    if (!r || typeof r !== "object") continue;
    allTagIds.push(...parseProgramTagsColumn(r.tags));
  }
  const catalogLabelById = await fetchCatalogTagLabelMap(client, allTagIds);

  return mapProfileToMember(dbProfile, catalogLabelById);
}
