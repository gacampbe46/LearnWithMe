/**
 * Page shells — match home section containers (`max-w-6xl`, responsive padding).
 */

/** Outer content width used across the app (same as `HomePage` sections). */
export const pageContainerClass =
  "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

/** Standard scrollable page `<main>`. */
export const pageMainClass = `${pageContainerClass} flex-1 py-10 pb-16`;

/** Pages with a sticky bottom bar need extra bottom padding. */
export const pageMainStickyClass = `${pageContainerClass} flex-1 py-10 pb-28`;

/** Session viewer with prev/next sticky nav. */
export const pageMainSessionClass = `${pageContainerClass} flex-1 py-10 pb-32`;

/**
 * Readable inner column for centered flows (login, onboarding, link hub)
 * inside the wide page shell.
 */
export const pageFocusedColumnClass = "mx-auto w-full max-w-xl";

/** Session tiles — matches home `popular-sessions` grid. */
export const sessionGridClass =
  "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3";

/** Program listing cards on profiles — matches home session tile grid. */
export const programGridClass = sessionGridClass;

/** Session/program card thumbnail — 16:9 to match YouTube stills. */
export const sessionThumbnailShellClass =
  "relative aspect-video overflow-hidden bg-stone-200 dark:bg-stone-800";
