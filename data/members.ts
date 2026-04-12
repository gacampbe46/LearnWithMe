import type { MemberProfile } from "./member";
import {KATHLEEN_MEMBER } from "./member";

const MEMBERS: MemberProfile[] = [KATHLEEN_MEMBER];

const BY_SLUG = new Map(MEMBERS.map((m) => [m.slug, m]));

export function getMemberBySlug(slug: string): MemberProfile | undefined {
  return BY_SLUG.get(slug);
}

export function listMemberSlugs(): string[] {
  return MEMBERS.map((m) => m.slug);
}
