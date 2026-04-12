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
  program: Program;
};

export const KATHLEEN_MEMBER: MemberProfile = {
  id: "kathleen",
  name: "Kathleen",
  slug: "kathleen",
  profileViewPreference: "full_content",
  tagline:
    "Theraband sessions, Pilates-style full-body work, and simple training that fits your life",
  bio: "Focused on efficient, repeatable workouts you can follow anywhere",
  channelUrl: "https://www.youtube.com/@kathleenchu",
  whatYouNeed: [
    "A theraband (resistance band) for the full-body Theraband sample",
    "A small Pilates ball for the beginner Pilates-style sample",
    "Clear floor space; a mat is nice to have",
  ],
  featuredPreviewVideos: [
    {
      videoId: "QvWW6M17CLw",
      title: "50 MINUTE | Full Body | Theraband",
    },
    {
      videoId: "aUv8WuNhZq0",
      title: "36 MINUTE | Beginner Full Body | Small Pilates Ball",
    },
  ],
  program: {
    id: "foundation",
    title: "Foundation Program",
    subtitle: "Three guided sessions — one simple price for the whole program",
    price: "$12 one-time — all sessions included",
    workouts: [
      {
        id: "day-1",
        title:
          "Day 1 — 20 MINUTE | Express Glutes & Inner Thigh Focus | Ankle Weights",
        description:
          "Short, focused lower-body session targeting glutes and inner thighs; ankle weights optional.",
        exercises: [
          {
            id: "express-glutes-inner-thigh",
            title:
              "Day 1 — 20 MINUTE | Express Glutes & Inner Thigh Focus | Ankle Weights",
            videoId: "YDXB0N0eAwc",
            setsReps: "Full session — follow along in the video",
            notes: [
              "Keep ribs stacked and glutes engaged — quality range over speed.",
              "If you use ankle weights, stop or lighten load if form slips.",
              "Breathe steadily; match Kathleen’s tempo and rest when she cues it.",
            ],
          },
        ],
      },
      {
        id: "day-2",
        title: "Day 2 — 26 MINUTE | Full Body Express | Optional Ankle Weights",
        description:
          "Efficient full-body express class; add ankle weights only if it still feels controlled.",
        exercises: [
          {
            id: "full-body-express",
            title: "Day 2 — 26 MINUTE | Full Body Express | Optional Ankle Weights",
            videoId: "QPLAqXiWa6Y",
            setsReps: "Full session — follow along in the video",
            notes: [
              "Move smoothly between segments; modify range before you sacrifice alignment.",
              "Ankle weights are optional — prioritize joint comfort and steady breathing.",
              "Pause the video anytime you need a slower setup between moves.",
            ],
          },
        ],
      },
      {
        id: "day-3",
        title: "Day 3 — Twist & Rotate | 47 min | Small Pilates Ball",
        description:
          "Longer rotation-focused Pilates-style session using a small ball for feedback and control.",
        exercises: [
          {
            id: "twist-rotate-pilates-ball",
            title: "Day 3 — Twist & Rotate | 47 min | Small Pilates Ball",
            videoId: "QfHHsTar1LI",
            setsReps: "Full session — follow along in the video",
            notes: [
              "Initiate rotation from the mid-back; keep neck and jaw soft.",
              "Use the ball to support alignment without gripping or collapsing.",
              "Exhale on effort; follow Kathleen’s pacing for each twist series.",
            ],
          },
        ],
      },
    ],
  },
};