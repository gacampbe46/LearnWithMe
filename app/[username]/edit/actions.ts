"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  friendlyDbPermissionMessage,
  isRlsOrPermissionError,
} from "@/lib/supabase/map-db-error";

type HubLinkDraft = {
  label: string;
  href: string;
  external: true;
};

function formText(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  return typeof v === "string" ? v : null;
}

function trimField(v: string | null, max: number): string {
  return (v ?? "").trim().slice(0, max);
}

function normalizeMaybeUrl(raw: string, allowPath: boolean): string | null {
  const v = raw.trim();
  if (!v) return null;

  if (allowPath && v.startsWith("/")) {
    return v;
  }

  try {
    const url = new URL(v);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function readHubLinks(formData: FormData, maxLinks: number): {
  links: HubLinkDraft[];
  error: string | null;
} {
  const links: HubLinkDraft[] = [];

  for (let i = 1; i <= maxLinks; i++) {
    const label = trimField(formText(formData, `hub_label_${i}`), 80);
    const hrefRaw = trimField(formText(formData, `hub_href_${i}`), 500);
    const href = hrefRaw ? normalizeMaybeUrl(hrefRaw, true) : null;

    if (!label && !hrefRaw) continue;

    if (!label) {
      return { links: [], error: `Link ${i}: label is required when a URL is provided.` };
    }
    if (!hrefRaw) {
      return { links: [], error: `Link ${i}: URL is required when a label is provided.` };
    }
    if (!href) {
      return {
        links: [],
        error: `Link ${i}: URL must be a valid http(s) URL (or a path starting with "/").`,
      };
    }

    links.push({ label, href, external: true });
  }

  return { links, error: null };
}

export type ProfileUpdateState = {
  formError: string | null;
};

export async function updateProfileByUsername(
  _prev: ProfileUpdateState,
  formData: FormData,
): Promise<ProfileUpdateState> {
  const username = trimField(formText(formData, "username"), 80).toLowerCase();
  if (!username) {
    return { formError: "Missing username." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { formError: "You are not signed in. Sign in and try again." };
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profile")
    .select("id, user_id")
    .eq("username", username)
    .maybeSingle();

  if (profileErr) {
    return {
      formError: isRlsOrPermissionError(profileErr)
        ? friendlyDbPermissionMessage()
        : profileErr.message,
    };
  }

  if (!profile?.id) {
    return { formError: "Profile not found." };
  }

  if (profile.user_id !== user.id) {
    return { formError: "You can only edit your own profile." };
  }

  const firstName = trimField(formText(formData, "first_name"), 80) || null;
  const lastName = trimField(formText(formData, "last_name"), 80) || null;
  const bio = trimField(formText(formData, "bio"), 2000);

  const channelUrlRaw = trimField(formText(formData, "channel_url"), 500);
  const channelUrl = channelUrlRaw ? normalizeMaybeUrl(channelUrlRaw, false) : null;
  if (channelUrlRaw && !channelUrl) {
    return { formError: "Channel URL must be a valid http(s) URL." };
  }

  const { links: hubLinks, error: hubLinksError } = readHubLinks(formData, 12);
  if (hubLinksError) {
    return { formError: hubLinksError };
  }

  const nextLinks = {
    channelUrl: channelUrl ?? "",
    hubLinks,
  };

  const { error: updErr } = await supabase
    .from("profile")
    .update({
      first_name: firstName,
      last_name: lastName,
      bio: bio || "",
      links: nextLinks,
    })
    .eq("id", profile.id)
    .eq("user_id", user.id);

  if (updErr) {
    return {
      formError: isRlsOrPermissionError(updErr)
        ? friendlyDbPermissionMessage()
        : updErr.message,
    };
  }

  redirect(safeNextPath(`/${username}`));
}

