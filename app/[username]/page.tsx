import { MemberProfileFullContent } from "@/components/member/MemberProfileFullContent";
import { MemberProfileLinkHub } from "@/components/member/MemberProfileLinkHub";
import {
  getMemberByUsername,
  parseProfileLayoutParam,
  resolveRenderedProfileView,
} from "@/lib/member";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ssoAvatarUrlFromUser } from "@/lib/auth/oauth-user";
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
  const member = await getMemberByUsername(username);

  if (!member) {
    notFound();
  }

  let viewerOwnsProfile = false;
  let viewerAvatarUrl: string | null = null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const teaching = await getTeachingProfile(supabase, user.id);
    viewerOwnsProfile = Boolean(teaching && teaching.id === member.id);
    if (viewerOwnsProfile) {
      viewerAvatarUrl = ssoAvatarUrlFromUser(user);
    }
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
        viewerAvatarUrl={viewerAvatarUrl}
      />
    );
  }

  return (
    <MemberProfileFullContent
      member={member}
      viewerOwnsProfile={viewerOwnsProfile}
      viewerAvatarUrl={viewerAvatarUrl}
    />
  );
}
