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

/** Session tiles — matches home `popular-sessions` grid (inside max-w page shells). */
export const sessionGridClass =
  "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3";

/**
 * Program / featured-session cards on full-width profiles.
 * Fixed column counts that shrink with the viewport (cap 30rem) —
 * avoids auto-fill reflow jumping as the page resizes.
 */
export const programGridClass =
  "grid grid-cols-1 justify-start gap-3 sm:grid-cols-[repeat(2,minmax(0,30rem))] sm:gap-4 lg:grid-cols-[repeat(3,minmax(0,30rem))]";

/** Session/program card thumbnail — 16:9 to match YouTube stills. */
export const sessionThumbnailShellClass =
  "relative aspect-video overflow-hidden bg-stone-200 dark:bg-stone-800";
