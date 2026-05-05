import type { MemberProfile, ProfileHubLink } from "@/data/member";

export function getProfileHubLinks(member: MemberProfile): ProfileHubLink[] {
  if (member.hubLinks && member.hubLinks.length > 0) {
    return member.hubLinks;
  }

  const defaults: ProfileHubLink[] = [];

  if (member.program) {
    defaults.push({
      label: `View ${member.program.title}`,
      href: `/${member.slug}/${member.program.id}`,
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
