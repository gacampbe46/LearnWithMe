/** Visual core shared by onboarding interests + program topic chips. */
const interestChipVisualCore =
  "inline-flex items-center rounded-full border border-zinc-300 bg-white py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/60";

/**
 * Unchecked onboarding interest pill (`profile-setup-form`) — unchanged padding.
 */
export const profileSetupInterestChipClasses =
  `${interestChipVisualCore} px-4`;

/** Extra classes paired with `.peer.sr-only` checkbox in onboarding only. */
export const profileSetupInterestChipPeerClasses =
  "peer-checked:border-zinc-900 peer-checked:bg-zinc-900 peer-checked:text-zinc-50 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-zinc-400 dark:peer-checked:border-zinc-100 dark:peer-checked:bg-zinc-100 dark:peer-checked:text-zinc-950 dark:peer-focus-visible:outline-zinc-500";

/** Filled pill (matches `peer-checked` chip look) for submit-based toggles without a checkbox peer. */
export const profileSetupInterestChipSelectedClasses =
  "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950";

/** Form wrapping label + × for program edits (aligned with onboarding look). */
export const programTopicChipRemoveFormClasses =
  `${interestChipVisualCore} cursor-default gap-1.5 pl-4 pr-1.5`;

