import type {
  FeaturedSessionLink,
  MemberProfile,
  Program,
  ProgramTopicTag,
} from "./types";
import { sessionVideoId } from "@/lib/program/thumbnail";

const FEATURED_LIMIT = 3;

function sessionLink(
  slug: string,
  program: Program,
  sessionId: string,
): FeaturedSessionLink | null {
  const index = program.sessions.findIndex((s) => s.id === sessionId);
  const session = index >= 0 ? program.sessions[index] : undefined;
  if (!session) return null;
  return {
    sessionId: session.id,
    programId: program.id,
    title: session.title,
    description: session.description,
    videoId: sessionVideoId(session),
    href: `/${slug}/${program.id}/${session.id}`,
    sessionNumber: index + 1,
    sessionTotal: program.sessions.length,
  };
}

function activeSessionPrograms(programs: Program[]): Map<string, Program> {
  const map = new Map<string, Program>();
  for (const program of programs) {
    if (!program.isActive) continue;
    for (const session of program.sessions) {
      map.set(session.id, program);
    }
  }
  return map;
}

/** Creator picks first; otherwise first sessions across newest active programs. */
export function resolveFeaturedSessions(
  member: MemberProfile,
  limit = FEATURED_LIMIT,
): FeaturedSessionLink[] {
  const programs = member.programs.filter((p) => p.isActive);
  if (programs.length === 0 || limit <= 0) return [];

  const byId = activeSessionPrograms(programs);
  const out: FeaturedSessionLink[] = [];
  const seen = new Set<string>();

  const push = (link: FeaturedSessionLink | null) => {
    if (!link || seen.has(link.sessionId) || out.length >= limit) return;
    seen.add(link.sessionId);
    out.push(link);
  };

  for (const id of member.featuredSessionIds) {
    const program = byId.get(id);
    if (program) push(sessionLink(member.slug, program, id));
  }

  if (out.length < limit) {
    for (const preview of member.featuredPreviewVideos) {
      if (out.length >= limit) break;
      for (const program of programs) {
        const session = program.sessions.find(
          (s) => sessionVideoId(s) === preview.videoId,
        );
        if (session) {
          push(sessionLink(member.slug, program, session.id));
          break;
        }
      }
    }
  }

  if (out.length < limit) {
    for (const program of programs) {
      if (out.length >= limit) break;
      const first = program.sessions[0];
      if (first) push(sessionLink(member.slug, program, first.id));
    }
  }

  if (out.length < limit) {
    for (const program of programs) {
      for (const session of program.sessions.slice(1)) {
        if (out.length >= limit) break;
        push(sessionLink(member.slug, program, session.id));
      }
      if (out.length >= limit) break;
    }
  }

  return out;
}

/** Profile Topics: interests from the profile, else unique program topic tags. */
export function profileTopicTags(member: MemberProfile): ProgramTopicTag[] {
  if (member.interestTags.length > 0) return member.interestTags;

  const byId = new Map<string, ProgramTopicTag>();
  for (const program of member.programs) {
    if (!program.isActive) continue;
    for (const tag of program.topicTags) {
      if (!byId.has(tag.id)) byId.set(tag.id, tag);
    }
  }
  return [...byId.values()].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}
