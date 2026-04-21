import { MemberProfileFullContent } from "@/components/member/MemberProfileFullContent";
import { MemberProfileLinkHub } from "@/components/member/MemberProfileLinkHub";
import { getMemberBySlug, listMemberSlugs } from "@/data/members";
import { getIsMobileVisitor } from "@/lib/device";
import { parseProfileLayoutParam } from "@/lib/profileLayoutQuery";
import { resolveRenderedProfileView } from "@/lib/profileView";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ layout?: string | string[] }>;
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

export default async function MemberProfilePage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const member = getMemberBySlug(username);

  if (!member) {
    notFound();
  }

  const sp = searchParams ? await searchParams : {};
  const layoutOverride = parseProfileLayoutParam(sp.layout);

  const isMobile = await getIsMobileVisitor();
  const view = resolveRenderedProfileView(
    member.profileViewPreference,
    isMobile,
    layoutOverride ?? null,
  );
  const hasLayoutQuery = layoutOverride !== null;

  if (view === "link_hub") {
    return (
      <MemberProfileLinkHub
        member={member}
        hasLayoutQuery={hasLayoutQuery}
      />
    );
  }

  return (
    <MemberProfileFullContent
      member={member}
      hasLayoutQuery={hasLayoutQuery}
    />
  );
}
