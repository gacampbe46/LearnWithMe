import { MemberProfileFullContent } from "@/components/member/MemberProfileFullContent";
import { MemberProfileLinkHub } from "@/components/member/MemberProfileLinkHub";
import { getMemberBySlug, listMemberSlugs } from "@/data/members";
import { getIsMobileVisitor } from "@/lib/device";
import { resolveRenderedProfileView } from "@/lib/profileView";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ username: string }>;
};

export function generateStaticParams() {
  return listMemberSlugs().map((username) => ({ username }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const member = getMemberBySlug(username);
  if (!member) {
    return { title: "Profile" };
  }
  return {
    title: `${member.name} — learnwithme`,
    description: member.tagline,
  };
}

export default async function MemberProfilePage({ params }: PageProps) {
  const { username } = await params;
  const member = getMemberBySlug(username);

  if (!member) {
    notFound();
  }

  const isMobile = await getIsMobileVisitor();
  const view = resolveRenderedProfileView(
    member.profileViewPreference,
    isMobile,
  );

  if (view === "link_hub") {
    return <MemberProfileLinkHub member={member} />;
  }

  return <MemberProfileFullContent member={member} />;
}
