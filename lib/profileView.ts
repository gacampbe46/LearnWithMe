import type { ProfileViewPreference } from "@/data/member";

export type RenderedProfileView = "link_hub" | "full_content";

/**
 * Picks which profile surface to render from the member's saved preference and
 * the visitor's device class. No query params or alternate URLs — same route.
 */
export function resolveRenderedProfileView(
  preference: ProfileViewPreference,
  isMobileVisitor: boolean,
): RenderedProfileView {
  if (preference === "link_hub") return "link_hub";
  if (preference === "full_content") return "full_content";
  // device_adaptive: compact link hub on small screens, full page on desktop
  return isMobileVisitor ? "link_hub" : "full_content";
}
