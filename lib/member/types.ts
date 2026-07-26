/**
 * Public teaching content for a member. The same account is meant to both
 * teach (offer programs) and learn (subscribe to others)—not separate roles.
 */
export type SessionMedia = {
  id: string;
  title: string;
  videoId: string;
  /** Short learner-facing text under the video (e.g. instructions). */
  caption: string;
  notes: string[];
};

export type ProgramSession = {
  id: string;
  title: string;
  description: string;
  media: SessionMedia[];
  /** DB `sessions.content_url` — link or bare ID — for instructor edit UI. */
  storedContentUrl: string | null;
};

/** Topics: catalog `tags.id` entries stored under `programs.tags` JSON (`tagIds`). */
export type ProgramTopicTag = {
  id: string;
  name: string;
};

export type Program = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  /** Raw amount from DB for edit forms (`null` when missing or invalid). */
  priceValue: number | null;
  sessions: ProgramSession[];
  /** Catalog topic IDs from `programs.tags` JSON (`{ tagIds }`), labels resolved when loading. */
  topicTags: ProgramTopicTag[];
  /** When false, hidden from learners on profile and blocked for anonymous viewers here. */
  isActive: boolean;
};

export type FeaturedPreviewVideo = {
  videoId: string;
  title: string;
};

export type ProfileViewPreference =
  | "link_hub"
  | "full_content"
  | "device_adaptive";

export type ProfileHubLink = {
  label: string;
  href: string;
  /** When true, opens in a new tab with noopener */
  external?: boolean;
};

export type MemberProfile = {
  id: string;
  name: string;
  slug: string;
  /** Public profile picture URL (`profile.avatar_url`), when set. */
  avatarUrl: string | null;
  /** Full-bleed banner image URL (`profile.tags.bannerUrl`), when set. */
  bannerUrl: string | null;
  bio: string;
  /** Short role / specialty line (`profile.tags.tagline`). */
  tagline: string;
  /** Optional invitation quote (`profile.tags.quote`). */
  quote: string;
  channelUrl: string;
  profileViewPreference: ProfileViewPreference;
  /** Optional link-in-bio ordering; defaults are derived if omitted. */
  hubLinks?: ProfileHubLink[];
  whatYouNeed?: string[];
  /** Profile interest tags from `profile.tags.tagIds` (edit form Interests). */
  interestTags: ProgramTopicTag[];
  /** Creator-curated session IDs for “Featured sessions” (`profile.tags.featuredSessionIds`). */
  featuredSessionIds: string[];
  /** Legacy seed field — prefer `featuredSessionIds` when resolving featured sessions. */
  featuredPreviewVideos: FeaturedPreviewVideo[];
  /** Programs for this profile, newest first when loaded from Supabase. */
  programs: Program[];
  /** First program (`programs[0]`), kept for callers that assume a primary offering. */
  program?: Program;
};

/** Resolved session card for profile featured sessions. */
export type FeaturedSessionLink = {
  sessionId: string;
  programId: string;
  title: string;
  description: string;
  programTitle: string;
  videoId: string | null;
  href: string;
  /** 1-based index within the parent program (for card meta). */
  sessionNumber: number;
  sessionTotal: number;
};

/** Resolve a program by id for `[username]/[programId]` routes. */
export function memberProgramById(
  member: MemberProfile,
  programId: string,
): Program | undefined {
  return member.programs.find((p) => p.id === programId);
}

export function memberProgramSessionById(
  program: Program,
  sessionId: string,
): ProgramSession | undefined {
  return program.sessions.find((s) => s.id === sessionId);
}
