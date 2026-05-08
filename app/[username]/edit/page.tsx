import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
    .select("id, user_id, username, first_name, last_name, bio, links")
    .eq("username", normalized)
    .maybeSingle();

  if (!profile?.id) {
    notFound();
  }

  if (profile.user_id !== user.id) {
    redirect(`/${normalized}`);
  }

  const linksRec = asRecord(profile.links);
  const channelUrl =
    linksRec && typeof linksRec.channelUrl === "string"
      ? linksRec.channelUrl.trim()
      : "";

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
          defaults={{
            firstName: (profile.first_name ?? "").trim(),
            lastName: (profile.last_name ?? "").trim(),
            bio: (profile.bio ?? "").trim(),
            channelUrl,
            links: profile.links,
          }}
        />
      </main>
    </div>
  );
}

