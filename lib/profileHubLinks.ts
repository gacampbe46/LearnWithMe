import type { MemberProfile, ProfileHubLink } from "@/data/member";

export function getProfileHubLinks(member: MemberProfile): ProfileHubLink[] {
  if (member.hubLinks && member.hubLinks.length > 0) {
    return member.hubLinks;
  }

  const defaults: ProfileHubLink[] = [];

  for (const program of member.programs) {
    defaults.push({
      label: `View ${program.title}`,
      href: `/${member.slug}/${program.id}`,
    });
  }

  if (member.channelUrl?.trim()) {
    defaults.push({
      label: "YouTube channel",
      href: member.channelUrl,
      external: true,
    });
  }

  defaults.push({
    label: "learnwithme home",
    href: "/",
  });

  return defaults;
}
