import { MemberProfileFullContent } from "@/components/member/MemberProfileFullContent";
import { MemberProfileLinkHub } from "@/components/member/MemberProfileLinkHub";
import {
  getMemberByUsername,
  getMemberByUsernameForOwner,
  parseProfileLayoutParam,
  resolveRenderedProfileView,
} from "@/lib/member";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTeachingProfile } from "@/lib/teach/teaching-profile";
import { getIsMobileVisitor } from "@/lib/device";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ layout?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const member = await getMemberByUsername(username);
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
  const normalized = username.trim().toLowerCase();

  let viewerOwnsProfile = false;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const teaching = await getTeachingProfile(supabase, user.id);
    viewerOwnsProfile = teaching?.username === normalized;
  }

  const member = viewerOwnsProfile
    ? (await getMemberByUsernameForOwner(normalized)) ??
      (await getMemberByUsername(normalized))
    : await getMemberByUsername(normalized);

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
  if (view === "link_hub") {
    return (
      <MemberProfileLinkHub
        member={member}
        viewerOwnsProfile={viewerOwnsProfile}
      />
    );
  }

  return (
    <MemberProfileFullContent
      member={member}
      viewerOwnsProfile={viewerOwnsProfile}
    />
  );
}
