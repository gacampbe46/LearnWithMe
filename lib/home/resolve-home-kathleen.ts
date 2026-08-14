import { getMemberByUsername } from "@/lib/member";
import type { MemberProfile, Program } from "@/lib/member/types";
import { KATHLEEN_PORTRAIT_ALT, KATHLEEN_PORTRAIT_SRC } from "@/lib/home/assets";
import {
  popularSessions as placeholderPopularSessions,
  spotlightSessions as placeholderSpotlightSessions,
  type HomeSession,
} from "@/lib/home/placeholder-data";
import { sessionThumbnailSrc } from "@/lib/program/thumbnail";

const KATHLEEN_SESSION_TITLE_NEEDLE: Record<string, string> = {
  "theraband-full-body": "theraband",
  "pilates-ball-beginner": "pilates ball",
  "foundation-day-1": "day 1",
};

function matchKathleenSession(
  program: Program | undefined,
  placeholderId: string,
) {
  const needle = KATHLEEN_SESSION_TITLE_NEEDLE[placeholderId];
  if (!program || !needle) return undefined;
  return program.sessions.find((s) => s.title.toLowerCase().includes(needle));
}

function resolveKathleenSessionHref(
  member: MemberProfile,
  program: Program | undefined,
  placeholder: Pick<HomeSession, "id" | "href">,
): string {
  const memberHref = `/${member.slug}`;
  if (!program) return memberHref;

  const programHref = `${memberHref}/${program.id}`;
  const matched = matchKathleenSession(program, placeholder.id);
  if (matched) return `${programHref}/${matched.id}`;

  return programHref;
}

function enrichKathleenSession(
  member: MemberProfile,
  program: Program | undefined,
  placeholder: HomeSession,
): HomeSession {
  const matched = matchKathleenSession(program, placeholder.id);
  const thumb = matched ? sessionThumbnailSrc(matched) : null;

  return {
    ...placeholder,
    href: resolveKathleenSessionHref(member, program, placeholder),
    imageSrc: thumb ?? placeholder.imageSrc,
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
        enrichKathleenSession(member, program, session),
      ),
    },
    popularSessions: placeholderPopularSessions.map((session) =>
      session.creatorName === "Kathleen"
        ? enrichKathleenSession(member, program, session)
        : session,
    ),
  };
}
