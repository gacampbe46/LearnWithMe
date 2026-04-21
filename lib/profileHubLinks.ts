import type { MemberProfile, ProfileHubLink } from "@/data/member";

export function getProfileHubLinks(member: MemberProfile): ProfileHubLink[] {
  if (member.hubLinks && member.hubLinks.length > 0) {
    return member.hubLinks;
  }

  return [
    {
      label: `View ${member.program.title}`,
      href: `/${member.slug}/${member.program.id}`,
    },
    {
      label: "YouTube channel",
      href: member.channelUrl,
      external: true,
    },
    {
      label: "learnwithme home",
      href: "/",
    },
  ];
}
