import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { listInterestTagOptions } from "@/lib/catalog/interest-tags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileViewPreference } from "@/lib/member/types";
import type { EditProfileLayoutDefault } from "./profile-edit-form";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import {
  bodyMutedClass,
  navLinkClass,
  subtitleSmClass,
  titlePrimaryClass,
} from "@/lib/ui/typography";
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
      <main className="mx-auto w-full max-w-lg px-4 py-10">
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
    .select("id, user_id, username, first_name, last_name, bio, links, tags")
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

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 space-y-8 px-4 py-10 pb-28">
        <nav>
          <Link href={`/${normalized}`} className={navLinkClass}>
            ← Back to profile
          </Link>
        </nav>

        <header className="space-y-1 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <h1 className={titlePrimaryClass}>Edit profile</h1>
          <p className={subtitleSmClass}>@{normalized}</p>
        </header>

        <ProfileEditForm
          username={normalized}
          interestTags={interestTags}
          tagsLoadError={tagsLoadError}
          defaults={{
            firstName: (profile.first_name ?? "").trim(),
            lastName: (profile.last_name ?? "").trim(),
            bio: (profile.bio ?? "").trim(),
            profileLayout,
            selectedInterestIds,
          }}
        />
      </main>
    </div>
  );
}
