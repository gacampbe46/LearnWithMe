/**
 * Public teaching content for a member. The same account is meant to both
 * teach (offer programs) and learn (subscribe to others)—not separate roles.
 */
export type Exercise = {
  id: string;
  title: string;
  videoId: string;
  setsReps: string;
  notes: string[];
};

export type Workout = {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
};

export type Program = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  workouts: Workout[];
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
  bio: string;
  tagline: string;
  channelUrl: string;
  profileViewPreference: ProfileViewPreference;
  /** Optional link-in-bio ordering; defaults are derived if omitted. */
  hubLinks?: ProfileHubLink[];
  whatYouNeed?: string[];
  featuredPreviewVideos: FeaturedPreviewVideo[];
  /** Omitted until the member has at least one program in the database. */
  program?: Program;
};