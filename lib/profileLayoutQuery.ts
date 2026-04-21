import type { RenderedProfileView } from "@/lib/profileView";

/** `?layout=` on `/${slug}` — preview the other surface; not stored. */
export type ProfileLayoutQueryValue = "hub" | "full";

export function profilePageHref(
  slug: string,
  layout: ProfileLayoutQueryValue,
): string {
  const q = new URLSearchParams({ layout });
  return `/${slug}?${q.toString()}`;
}

export function parseProfileLayoutParam(
  layout: string | string[] | undefined,
): RenderedProfileView | null {
  const raw = Array.isArray(layout) ? layout[0] : layout;
  if (raw === "hub") return "link_hub";
  if (raw === "full") return "full_content";
  return null;
}
