import {
  JORDAN_3D_PRINTING_ALT,
  JORDAN_3D_PRINTING_SRC,
  KATHLEEN_PORTRAIT_ALT,
  KATHLEEN_PORTRAIT_SRC,
  MAYA_SEWING_ALT,
  MAYA_SEWING_SRC,
  SAM_WATERCOLOR_ALT,
  SAM_WATERCOLOR_SRC,
  SESSION_BED_LEVELING_ALT,
  SESSION_BED_LEVELING_SRC,
  SESSION_CAMI_POLE_ALT,
  SESSION_CAMI_POLE_SRC,
  SESSION_KATHLEEN_THERABAND_ALT,
  SESSION_KATHLEEN_THERABAND_SRC,
  SESSION_LEMON_PASTA_ALT,
  SESSION_LEMON_PASTA_SRC,
  SESSION_WATERCOLOR_FLORALS_ALT,
  SESSION_WATERCOLOR_FLORALS_SRC,
  SESSION_ZIPPER_POUCH_ALT,
  SESSION_ZIPPER_POUCH_SRC,
} from "@/lib/home/assets";
import { unsplashPhoto, youtubeThumb } from "@/lib/home/media";

const ELENA_KITCHEN_PHOTO = "1556910103-1c02745aae4d";

export type HomeCreator = {
  id: string;
  name: string;
  role: string;
  bio: string;
  quote: string;
  programCount: number;
  sessionCount: number;
  imageSrc: string;
  imageAlt: string;
  href: string | null;
};

export type HomeSession = {
  id: string;
  title: string;
  creatorName: string;
  programName?: string;
  duration: string;
  skillLevel: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
};

export const featuredCreators: HomeCreator[] = [
  {
    id: "kathleen",
    name: "Kathleen",
    role: "Pilates & theraband",
    bio: "Known for calm, beginner-friendly routines you can follow anywhere.",
    quote:
      "I teach the way I train — calm pacing, clear cues, and sessions you can actually repeat.",
    programCount: 1,
    sessionCount: 3,
    imageSrc: KATHLEEN_PORTRAIT_SRC,
    imageAlt: KATHLEEN_PORTRAIT_ALT,
    href: "/kathleen",
  },
  {
    id: "maya",
    name: "Maya Lin",
    role: "Sewing",
    bio: "Slow fashion programs with clear pattern walks and fabric tips.",
    quote: "Every program starts with fabric you can trust and seams you can see.",
    programCount: 2,
    sessionCount: 14,
    imageSrc: MAYA_SEWING_SRC,
    imageAlt: MAYA_SEWING_ALT,
    href: null,
  },
  {
    id: "jordan",
    name: "Jordan Reyes",
    role: "3D printing",
    bio: "Practical prints for home makers — from calibration to finishing.",
    quote: "If the first layer is right, the rest of the program gets easier.",
    programCount: 1,
    sessionCount: 11,
    imageSrc: JORDAN_3D_PRINTING_SRC,
    imageAlt: JORDAN_3D_PRINTING_ALT,
    href: null,
  },
  {
    id: "elena",
    name: "Elena Park",
    role: "Home cooking",
    bio: "Weeknight meals that feel special without extra fuss.",
    quote: "Short sessions, real plates — programs built for busy evenings.",
    programCount: 3,
    sessionCount: 19,
    imageSrc: unsplashPhoto(ELENA_KITCHEN_PHOTO),
    imageAlt: "Home cook preparing ingredients in a warm kitchen",
    href: null,
  },
  {
    id: "sam",
    name: "Sam Okonkwo",
    role: "Watercolor",
    bio: "Loose florals and sketchbook habits for painters who overthink less.",
    quote: "Paint in small sessions until the sketchbook feels like yours.",
    programCount: 2,
    sessionCount: 9,
    imageSrc: SAM_WATERCOLOR_SRC,
    imageAlt: SAM_WATERCOLOR_ALT,
    href: null,
  },
];

export const popularSessions: HomeSession[] = [
  {
    id: "theraband-full-body",
    title: "50 Minute Full Body Theraband",
    creatorName: "Kathleen",
    programName: "Foundation Program",
    duration: "50 min",
    skillLevel: "All levels",
    imageSrc: SESSION_KATHLEEN_THERABAND_SRC,
    imageAlt: SESSION_KATHLEEN_THERABAND_ALT,
    href: "/kathleen",
  },
  {
    id: "pattern-basics",
    title: "Your First Zipper Pouch",
    creatorName: "Maya Lin",
    programName: "Stitch Basics",
    duration: "28 min",
    skillLevel: "Beginner",
    imageSrc: SESSION_ZIPPER_POUCH_SRC,
    imageAlt: SESSION_ZIPPER_POUCH_ALT,
    href: "/kathleen",
  },
  {
    id: "calibration-101",
    title: "Bed Leveling Without the Headache",
    creatorName: "Jordan Reyes",
    programName: "Printer Setup",
    duration: "22 min",
    skillLevel: "Beginner",
    imageSrc: SESSION_BED_LEVELING_SRC,
    imageAlt: SESSION_BED_LEVELING_ALT,
    href: "/kathleen",
  },
  {
    id: "weeknight-pasta",
    title: "Creamy Lemon Pasta for Two",
    creatorName: "Elena Park",
    programName: "Weeknight Table",
    duration: "18 min",
    skillLevel: "Easy",
    imageSrc: SESSION_LEMON_PASTA_SRC,
    imageAlt: SESSION_LEMON_PASTA_ALT,
    href: "/kathleen",
  },
  {
    id: "loose-florals",
    title: "Loose Florals in 20 Minutes",
    creatorName: "Sam Okonkwo",
    programName: "Sketchbook Florals",
    duration: "20 min",
    skillLevel: "All levels",
    imageSrc: SESSION_WATERCOLOR_FLORALS_SRC,
    imageAlt: SESSION_WATERCOLOR_FLORALS_ALT,
    href: "/kathleen",
  },
  {
    id: "pole-first-climb",
    title: "Intro Pole: First Climb",
    creatorName: "Cami Árboles",
    programName: "Foundation Flow",
    duration: "30 min",
    skillLevel: "Beginner",
    imageSrc: SESSION_CAMI_POLE_SRC,
    imageAlt: SESSION_CAMI_POLE_ALT,
    href: "/kathleen",
  },
];

export const spotlightCreator = featuredCreators[0];

export const spotlightSessions: HomeSession[] = [
  popularSessions[0],
  {
    id: "pilates-ball-beginner",
    title: "Beginner Full Body — Small Pilates Ball",
    creatorName: "Kathleen",
    programName: "Foundation Program",
    duration: "36 min",
    skillLevel: "Beginner",
    imageSrc: youtubeThumb("aUv8WuNhZq0"),
    imageAlt: "Pilates ball beginner session preview",
    href: "/kathleen",
  },
  {
    id: "foundation-day-1",
    title: "Express Glutes & Inner Thigh",
    creatorName: "Kathleen",
    programName: "Foundation Program",
    duration: "20 min",
    skillLevel: "All levels",
    imageSrc: youtubeThumb("YDXB0N0eAwc"),
    imageAlt: "Foundation program session preview",
    href: "/kathleen",
  },
];
