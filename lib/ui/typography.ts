/**
 * Shared text styles — editorial palette aligned with the home page.
 */

/** Inline nav / tertiary links (← back, Profile, etc.) */
export const navLinkClass =
  "text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100";

/** Page or major section title (matches Section heading scale) */
export const titlePrimaryClass =
  "font-serif-display text-2xl font-semibold leading-tight text-stone-900 dark:text-stone-50 sm:text-3xl";

/** Auth flows, onboarding main heading */
export const titleDisplayClass =
  "font-serif-display text-3xl font-semibold leading-tight text-stone-900 dark:text-stone-50 sm:text-4xl";

/** Compact tool header (narrow columns, nested hubs) */
export const titleMediumClass =
  "font-serif-display text-2xl font-semibold leading-tight text-stone-900 dark:text-stone-50";

/** Profile display name row */
export const titleProfileClass =
  "font-serif-display text-3xl font-semibold leading-tight text-stone-900 dark:text-stone-50 sm:text-4xl";

/** Inline subsection title (cards, lists, edit panels) */
export const titleSubsectionClass =
  "font-serif-display text-xl font-semibold leading-tight text-stone-900 dark:text-stone-50";

/** Markdown / dense lists, in-page section titles (“Sessions”) */
export const titleSmallClass =
  "font-serif-display text-base font-semibold leading-tight text-stone-900 dark:text-stone-50";

/** Card session title & similar */
export const titleCardClass =
  "font-serif-display text-lg font-semibold leading-snug text-stone-900 dark:text-stone-50";

/**
 * Quiet context line above a title (“learnwithme”, “Member”) — not a section heading.
 */
export const sectionEyebrowClass =
  "text-[10px] font-medium uppercase tracking-[0.14em] text-editorial-accent";

/** Small meta line (e.g. “Session 2 of 5”) */
export const metaCapsClass =
  "text-xs font-medium text-stone-500 dark:text-stone-400";

/** One line under a page title */
export const subtitleSmClass =
  "text-sm leading-relaxed text-stone-600 dark:text-stone-400";

/** SectionHeader-style subtitle, intro paragraphs */
export const bodyLeadClass =
  "text-base leading-relaxed text-stone-600 dark:text-stone-400";

/** Bio / longer profile body */
export const bodyRelaxedLargeClass =
  "text-lg leading-relaxed text-stone-600 dark:text-stone-400";

/** Default body / secondary copy */
export const bodyMutedClass =
  "text-sm leading-relaxed text-stone-600 dark:text-stone-400";

/** Short bold line at base size (e.g. price in a dense card) */
export const bodyStrongClass =
  "text-base font-medium text-stone-900 dark:text-stone-50";

/** Small UI label (toggle row title, etc.) */
export const labelStrongSmClass =
  "text-sm font-medium text-stone-900 dark:text-stone-50";

/** Short helper / hint lines */
export const captionClass =
  "text-xs leading-relaxed text-stone-600 dark:text-stone-400";

/** “(optional)” beside a label */
export const optionalHintClass =
  "font-normal text-stone-500 dark:text-stone-400";

/** Prominent one-line under a display name */
export const leadMutedClass =
  "text-xl font-medium text-stone-700 dark:text-stone-300";

/** Form field labels */
export const formLabelClass =
  "block text-sm font-medium text-stone-700 dark:text-stone-300";

/** Fieldset legend — same emphasis as labels, without `block` */
export const formLegendClass =
  "text-sm font-medium text-stone-700 dark:text-stone-300";

/** Shared text input / textarea shell */
export const inputFieldClass =
  "w-full rounded-xl border border-editorial-border bg-editorial-card px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500";

/** Focus ring / border states for text inputs (pair with `inputFieldClass`). */
export const inputFocusClass =
  "focus:border-editorial-accent-muted focus:ring-2 focus:ring-editorial-accent-muted/30 dark:focus:border-editorial-accent-muted dark:focus:ring-editorial-accent-muted/25";

/** Icon-only control (share, edit, etc.) */
export const iconButtonClass =
  "inline-flex shrink-0 items-center justify-center rounded-md p-1.5 text-stone-600 transition hover:bg-stone-200/80 hover:text-stone-900 disabled:opacity-60 dark:text-stone-400 dark:hover:bg-stone-800/40 dark:hover:text-stone-100";

/** Section / card divider */
export const dividerBorderClass = "border-editorial-border";

/** Inline link with underline (body copy) */
export const textLinkUnderlineClass =
  "font-medium text-stone-900 underline decoration-editorial-accent-muted underline-offset-4 transition hover:text-stone-950 hover:decoration-editorial-accent dark:text-stone-100 dark:decoration-stone-600 dark:hover:text-stone-50 dark:hover:decoration-editorial-accent-muted";

/** `<strong>` in long-form prose */
export const proseStrongClass =
  "font-medium text-stone-800 dark:text-stone-200";

/** Muted foreground link (footnotes, legal) */
export const textLinkMutedClass =
  "font-medium text-stone-700 underline decoration-editorial-accent-muted underline-offset-4 transition hover:text-stone-900 hover:decoration-editorial-accent dark:text-stone-400 dark:hover:text-stone-200 dark:hover:decoration-stone-500";

/** Larger intro line under auth / panel titles */
export const introLeadClass =
  "text-lg leading-relaxed text-stone-600 dark:text-stone-400";

/** Standout one-liner (e.g. price under a card title) */
export const bodyEmphasisClass =
  "text-lg font-medium text-stone-900 dark:text-stone-50";

/** Footer / ancillary sentence */
export const ancillaryClass =
  "text-center text-sm text-stone-600 dark:text-stone-400";
