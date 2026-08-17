import { notFound, redirect } from "next/navigation";
import { listInterestTagOptions } from "@/lib/catalog/interest-tags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileViewPreference } from "@/lib/member/types";
import type { EditProfileLayoutDefault } from "./profile-edit-form";
import type { FeaturedSessionOption } from "@/components/member/featured-sessions-picker";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import {
  bodyMutedClass,
  titlePrimaryClass,
} from "@/lib/ui/typography";
import { pageContainerClass, pageMainStickyClass } from "@/lib/ui/page-layout";
import { ProfileEditForm } from "./profile-edit-form";

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function parseProfileLayout(value: unknown): ProfileViewPreference | undefined {
  if (value === "link_hub" || value === "full_content" || value === "device_adaptive") {
    return value;
  }
  return undefined;
}

/** Edit UI only offers hub vs full; legacy `device_adaptive` maps to full. */
function layoutDefaultForEditForm(raw: ProfileViewPreference | undefined): EditProfileLayoutDefault {
  if (raw === "link_hub") return "link_hub";
  return "full_content";
}

function tagIdsFromProfile(tags: unknown): string[] {
  const rec = asRecord(tags);
  const raw = rec?.tagIds;
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === "string");
}

function stringFromTags(tags: unknown, key: string): string {
  const rec = asRecord(tags);
  const v = rec?.[key];
  return typeof v === "string" ? v.trim() : "";
}

function stringArrayFromTags(tags: unknown, key: string): string[] {
  const rec = asRecord(tags);
  const raw = rec?.[key];
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

function bannerUrlFromTags(tags: unknown): string | null {
  const raw = stringFromTags(tags, "bannerUrl");
  return raw || null;
}

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const normalized = username.trim().toLowerCase();
  if (!normalized) notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className={`${pageContainerClass} py-10`}>
        <Card className="space-y-4">
          <h1 className={titlePrimaryClass}>Edit profile</h1>
          <p className={bodyMutedClass}>You need to sign in first.</p>
          <Button href="/login" className="w-full">
            Go to login
          </Button>
        </Card>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profile")
    .select(
      "id, user_id, username, first_name, last_name, bio, avatar_url, links, tags, is_instructor",
    )
    .eq("username", normalized)
    .maybeSingle();

  if (!profile?.id) {
    notFound();
  }

  if (profile.user_id !== user.id) {
    redirect(`/${normalized}`);
  }

  const linksRec = asRecord(profile.links);
  const tagsRec = asRecord(profile.tags);
  const layoutFromLinks = parseProfileLayout(linksRec?.profileViewPreference);
  const layoutFromTags = parseProfileLayout(tagsRec?.profileViewPreference);
  const storedLayout: ProfileViewPreference =
    layoutFromLinks ?? layoutFromTags ?? "full_content";
  const profileLayout = layoutDefaultForEditForm(storedLayout);

  const { options: interestTags, error: tagsLoadError } =
    await listInterestTagOptions(supabase);
  const selectedInterestIds = tagIdsFromProfile(profile.tags);

  const isInstructor = profile.is_instructor === true;

  const { data: programRows } = isInstructor
    ? await supabase
        .from("programs")
        .select("id, title, sessions(id, title, sort_order)")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false })
    : { data: null };

  const sessionOptions: FeaturedSessionOption[] = [];
  for (const program of programRows ?? []) {
    const programTitle =
      typeof program.title === "string" && program.title.trim()
        ? program.title.trim()
        : "Program";
    const sessions = Array.isArray(program.sessions) ? [...program.sessions] : [];
    sessions.sort((a, b) => {
      const sa = typeof a.sort_order === "number" ? a.sort_order : 0;
      const sb = typeof b.sort_order === "number" ? b.sort_order : 0;
      return sa - sb;
    });
    for (const session of sessions) {
      if (typeof session.id !== "string") continue;
      sessionOptions.push({
        sessionId: session.id,
        title:
          typeof session.title === "string" && session.title.trim()
            ? session.title.trim()
            : "Session",
        programTitle,
      });
    }
  }

  const storedFeatured = stringArrayFromTags(profile.tags, "featuredSessionIds");
  const optionIds = new Set(sessionOptions.map((o) => o.sessionId));
  const featuredSessionIds = storedFeatured.filter((id) => optionIds.has(id));

  return (
    <div className="flex min-h-dvh flex-col">
      <main className={`${pageMainStickyClass} space-y-8`}>
        <header className="space-y-1 border-b border-editorial-border pb-4">
          <h1 className={titlePrimaryClass}>Edit profile</h1>
        </header>

        <ProfileEditForm
          username={normalized}
          userId={user.id}
          isInstructor={isInstructor}
          interestTags={interestTags}
          tagsLoadError={tagsLoadError}
          sessionOptions={sessionOptions}
          defaults={{
            firstName: (profile.first_name ?? "").trim(),
            lastName: (profile.last_name ?? "").trim(),
            bio: (profile.bio ?? "").trim(),
            tagline: stringFromTags(profile.tags, "tagline"),
            quote: stringFromTags(profile.tags, "quote"),
            avatarUrl:
              typeof profile.avatar_url === "string" && profile.avatar_url.trim()
                ? profile.avatar_url.trim()
                : null,
            bannerUrl: bannerUrlFromTags(profile.tags),
            profileLayout,
            selectedInterestIds,
            featuredSessionIds,
          }}
        />
      </main>
    </div>
  );
}
