import { getMemberByUsername } from "@/lib/member";
import type { MemberProfile, Program } from "@/lib/member/types";
import { KATHLEEN_PORTRAIT_ALT, KATHLEEN_PORTRAIT_SRC } from "@/lib/home/assets";
import { youtubeThumb } from "@/lib/home/media";
import {
  popularSessions as placeholderPopularSessions,
  spotlightSessions as placeholderSpotlightSessions,
  type HomeSession,
} from "@/lib/home/placeholder-data";

const KATHLEEN_SESSION_VIDEO_IDS: Record<string, string> = {
  "theraband-full-body": "QvWW6M17CLw",
  "pilates-ball-beginner": "aUv8WuNhZq0",
  "foundation-day-1": "YDXB0N0eAwc",
};

const KATHLEEN_SESSION_TITLE_NEEDLE: Record<string, string> = {
  "theraband-full-body": "theraband",
  "pilates-ball-beginner": "pilates ball",
  "foundation-day-1": "day 1",
};

function videoIdFromSession(placeholder: Pick<HomeSession, "imageSrc" | "id">): string | null {
  if (KATHLEEN_SESSION_VIDEO_IDS[placeholder.id]) {
    return KATHLEEN_SESSION_VIDEO_IDS[placeholder.id];
  }
  const match = placeholder.imageSrc.match(/\/vi\/([^/]+)\//);
  return match?.[1] ?? null;
}

function resolveKathleenSessionHref(
  member: MemberProfile,
  program: Program | undefined,
  placeholder: Pick<HomeSession, "id" | "href" | "imageSrc">,
): string {
  const memberHref = `/${member.slug}`;
  if (!program) return memberHref;

  const programHref = `${memberHref}/${program.id}`;
  const videoId = videoIdFromSession(placeholder);

  if (videoId) {
    const byVideo = program.sessions.find(
      (s) => s.media[0]?.videoId?.trim() === videoId,
    );
    if (byVideo) return `${programHref}/${byVideo.id}`;
  }

  const needle = KATHLEEN_SESSION_TITLE_NEEDLE[placeholder.id];
  if (needle) {
    const byTitle = program.sessions.find((s) =>
      s.title.toLowerCase().includes(needle),
    );
    if (byTitle) return `${programHref}/${byTitle.id}`;
  }

  return programHref;
}

function enrichKathleenSession(
  member: MemberProfile,
  program: Program | undefined,
  placeholder: HomeSession,
  options?: { preferYouTubeThumb?: boolean },
): HomeSession {
  const videoId = videoIdFromSession(placeholder);
  const useYoutubeThumb =
    options?.preferYouTubeThumb ??
    (placeholder.imageSrc.includes("ytimg.com") ||
      placeholder.imageSrc.includes("youtube.com"));

  return {
    ...placeholder,
    href: resolveKathleenSessionHref(member, program, placeholder),
    imageSrc:
      videoId && useYoutubeThumb
        ? youtubeThumb(videoId, "max")
        : placeholder.imageSrc,
  };
}

export type KathleenSpotlight = {
  sampleProgramHref: string;
  portraitSrc: string;
  portraitAlt: string;
  sessions: HomeSession[];
};

export type HomeKathleenContent = {
  spotlight: KathleenSpotlight;
  popularSessions: HomeSession[];
};

const spotlightFallback: KathleenSpotlight = {
  sampleProgramHref: "/kathleen",
  portraitSrc: KATHLEEN_PORTRAIT_SRC,
  portraitAlt: KATHLEEN_PORTRAIT_ALT,
  sessions: placeholderSpotlightSessions,
};

/** One Kathleen lookup for hero spotlight + popular sessions grid. */
export async function resolveHomeKathleenContent(): Promise<HomeKathleenContent> {
  const member = await getMemberByUsername("kathleen");
  if (!member) {
    return {
      spotlight: spotlightFallback,
      popularSessions: placeholderPopularSessions,
    };
  }

  const program = member.programs.find((p) => p.isActive) ?? member.programs[0];
  const programHref = program ? `/${member.slug}/${program.id}` : `/${member.slug}`;

  return {
    spotlight: {
      sampleProgramHref: programHref,
      portraitSrc: KATHLEEN_PORTRAIT_SRC,
      portraitAlt: KATHLEEN_PORTRAIT_ALT,
      sessions: placeholderSpotlightSessions.map((session) =>
        enrichKathleenSession(member, program, session, { preferYouTubeThumb: true }),
      ),
    },
    popularSessions: placeholderPopularSessions.map((session) =>
      session.creatorName === "Kathleen"
        ? enrichKathleenSession(member, program, session)
        : session,
    ),
  };
}
