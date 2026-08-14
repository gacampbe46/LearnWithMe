import { getMemberByUsername } from "@/lib/member";
import { KATHLEEN_PORTRAIT_ALT, KATHLEEN_PORTRAIT_SRC } from "@/lib/home/assets";
import {
  popularSessions as placeholderPopularSessions,
  spotlightSessions as placeholderSpotlightSessions,
  type HomeSession,
} from "@/lib/home/placeholder-data";

const SAMPLE_USERNAME = "learnwithme";
const SAMPLE_PROGRAM_TITLE = "Get to Sewing";

export type HomeSpotlight = {
  sampleProgramHref: string;
  portraitSrc: string;
  portraitAlt: string;
  sessions: HomeSession[];
};

export type HomeSampleContent = {
  spotlight: HomeSpotlight;
  popularSessions: HomeSession[];
};

/** Hero CTA target: live "Get to Sewing", falling back to the sample profile. */
async function resolveSampleProgramHref(): Promise<string> {
  const member = await getMemberByUsername(SAMPLE_USERNAME);
  if (!member) return `/${SAMPLE_USERNAME}`;

  const active = member.programs.filter((p) => p.isActive);
  const pool = active.length > 0 ? active : member.programs;
  const program = pool.find(
    (p) => p.title.trim().toLowerCase() === SAMPLE_PROGRAM_TITLE.toLowerCase(),
  );

  return program ? `/${member.slug}/${program.id}` : `/${member.slug}`;
}

/** Kathleen stays the visual spotlight; only the sample-program CTA is live. */
export async function resolveHomeSampleContent(): Promise<HomeSampleContent> {
  return {
    spotlight: {
      sampleProgramHref: await resolveSampleProgramHref(),
      portraitSrc: KATHLEEN_PORTRAIT_SRC,
      portraitAlt: KATHLEEN_PORTRAIT_ALT,
      sessions: placeholderSpotlightSessions,
    },
    popularSessions: placeholderPopularSessions,
  };
}
