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

export type Instructor = {
  id: string;
  name: string;
  slug: string;
  bio: string;
  tagline: string;
  channelUrl: string;
  whatYouNeed?: string[];
  featuredPreviewVideos: FeaturedPreviewVideo[];
  program: Program;
};

export const KATHLEEN_INSTRUCTOR: Instructor = {
  id: "kathleen-chu",
  name: "Kathleen Chu",
  slug: "kathleen-chu",
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
    subtitle: "Structured workouts you can follow in any gym",
    price: "$12/month",
    workouts: [
      {
        id: "day-1",
        title: "Day 1: Lower Body + Core",
        description:
          "Glutes, hamstrings, and deep core — steady tempo, full control.",
        exercises: [
          {
            id: "goblet-squat",
            title: "Goblet Squat",
            videoId: "YDXB0N0eAwc",
            setsReps: "3 × 10",
            notes: [
              "Hold the weight at your chest, ribs stacked over hips.",
              "Sit between your hips; keep heels planted and knees tracking over toes.",
              "Pause at the bottom, breathe out as you stand tall.",
            ],
          },
          {
            id: "romanian-deadlift",
            title: "Romanian Deadlift",
            videoId: "QPLAqXiWa6Y",
            setsReps: "3 × 10",
            notes: [
              "Soft bend in the knees; hinge from the hips, not the lower back.",
              "Keep the bar or dumbbells close to your legs the whole way.",
              "Stop when you feel a strong hamstring stretch, then drive hips forward.",
            ],
          },
          {
            id: "core-rotation",
            title: "Core Rotation",
            videoId: "QfHHsTar1LI",
            setsReps: "3 × 8 each side",
            notes: [
              "Move from your mid-back, not your neck or elbows.",
              "Exhale as you rotate; keep the lower ribs quiet.",
              "Follow Kathleen’s pacing — quality reps over speed.",
            ],
          },
        ],
      },
    ],
  },
};
