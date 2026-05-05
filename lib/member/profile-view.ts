import type { ProfileViewPreference } from "./types";

export type RenderedProfileView = "link_hub" | "full_content";

/**
 * Resolves the profile surface: optional `?layout=` wins; otherwise uses the
 * member’s `baseUrlViewPreference` at `/{slug}`, using device type when
 * `device_adaptive`.
 */
export function resolveRenderedProfileView(
  profileViewPreference: ProfileViewPreference,
  isMobileVisitor: boolean,
  layoutOverride?: RenderedProfileView | null,
): RenderedProfileView {
  if (layoutOverride) {
    return layoutOverride;
  }
  if (profileViewPreference === "link_hub") return "link_hub";
  if (profileViewPreference === "full_content") return "full_content";
  // device_adaptive: compact link hub on small screens, full page on desktop
  return isMobileVisitor ? "link_hub" : "full_content";
}
