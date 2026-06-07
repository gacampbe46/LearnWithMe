/** Visual core shared by onboarding interests + program topic chips. */
const interestChipVisualCore =
  "inline-flex items-center rounded-full border border-editorial-border bg-editorial-card py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:border-editorial-accent hover:text-stone-900 dark:text-stone-300 dark:hover:border-editorial-accent dark:hover:text-stone-100";

/**
 * Unchecked onboarding interest pill (`profile-setup-form`) — unchanged padding.
 */
export const profileSetupInterestChipClasses =
  `${interestChipVisualCore} px-4`;

/** Extra classes paired with `.peer.sr-only` checkbox in onboarding only. */
export const profileSetupInterestChipPeerClasses =
  "peer-checked:border-stone-900 peer-checked:bg-stone-900 peer-checked:text-stone-50 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-editorial-accent-muted dark:peer-checked:border-stone-100 dark:peer-checked:bg-stone-100 dark:peer-checked:text-stone-900 dark:peer-focus-visible:outline-stone-500";

/** Filled pill (matches `peer-checked` chip look) for submit-based toggles without a checkbox peer. */
export const profileSetupInterestChipSelectedClasses =
  "border-stone-900 bg-stone-900 text-stone-50 dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900";

/** Form wrapping label + × for program edits (aligned with onboarding look). */
export const programTopicChipRemoveFormClasses =
  `${interestChipVisualCore} cursor-default gap-1.5 pl-4 pr-1.5`;
