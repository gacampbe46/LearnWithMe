import { createSupabaseServerClient } from "@/lib/supabase/server";

export type NavAccount = {
  displayName: string;
  profilePath: string | null;
};

function displayNameFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): string {
  const meta = user.user_metadata ?? {};
  const pick = (key: string) => {
    const v = meta[key];
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };
  return (
    pick("full_name") ??
    pick("name") ??
    pick("given_name") ??
    (user.email?.split("@")[0] ?? "Account")
  );
}

export async function getNavAccount(): Promise<NavAccount | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const displayName = displayNameFromUser(user);

  const { data: profile } = await supabase
    .from("profile")
    .select("username")
    .eq("user_id", user.id)
    .maybeSingle();

  const username =
    profile && typeof profile.username === "string" ? profile.username : null;
  const profilePath = username ? `/${username}` : null;

  return { displayName, profilePath };
}
