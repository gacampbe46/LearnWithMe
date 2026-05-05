/**
 * Shared text styles — keep headings, body, and nav visually consistent.
 */

/** Inline nav / tertiary links (← back, Profile, etc.) */
export const navLinkClass =
  "text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

/** Page or major section title (matches Section heading scale) */
export const titlePrimaryClass =
  "text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl";

/** Auth flows, onboarding main heading */
export const titleDisplayClass =
  "text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl";

/** Compact tool header (narrow columns, nested hubs) */
export const titleMediumClass =
  "text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100";

/** Profile display name row */
export const titleProfileClass =
  "text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl";

/** Inline subsection title (cards, lists, edit panels) */
export const titleSubsectionClass =
  "text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100";

/** Markdown / dense lists, in-page section titles (“Sessions”) */
export const titleSmallClass =
  "text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100";

/** Card session title & similar */
export const titleCardClass =
  "text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-100";

/**
 * Quiet context line above a title (“learnwithme”, “Member”) — not a section heading.
 */
export const sectionEyebrowClass =
  "text-sm font-medium text-zinc-500 dark:text-zinc-400";

/** Small meta line (e.g. “Session 2 of 5”) */
export const metaCapsClass =
  "text-xs font-medium text-zinc-500 dark:text-zinc-400";

/** One line under a page title */
export const subtitleSmClass =
  "text-sm leading-relaxed text-zinc-600 dark:text-zinc-400";

/** SectionHeader-style subtitle, intro paragraphs */
export const bodyLeadClass =
  "text-base leading-relaxed text-zinc-600 dark:text-zinc-400";

/** Bio / longer profile body */
export const bodyRelaxedLargeClass =
  "text-lg leading-relaxed text-zinc-600 dark:text-zinc-400";

/** Default body / secondary copy */
export const bodyMutedClass =
  "text-sm leading-relaxed text-zinc-600 dark:text-zinc-400";

/** Short bold line at base size (e.g. price in a dense card) */
export const bodyStrongClass =
  "text-base font-medium text-zinc-900 dark:text-zinc-100";

/** Small UI label (toggle row title, etc.) */
export const labelStrongSmClass =
  "text-sm font-medium text-zinc-900 dark:text-zinc-100";

/** Short helper / hint lines */
export const captionClass =
  "text-xs leading-relaxed text-zinc-600 dark:text-zinc-400";

/** “(optional)” beside a label */
export const optionalHintClass =
  "font-normal text-zinc-500 dark:text-zinc-400";

/** Prominent one-line under a display name */
export const leadMutedClass =
  "text-xl font-medium text-zinc-700 dark:text-zinc-300";

/** Form field labels */
export const formLabelClass =
  "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

/** Fieldset legend — same emphasis as labels, without `block` */
export const formLegendClass =
  "text-sm font-medium text-zinc-700 dark:text-zinc-300";

/** Shared text input / textarea shell */
export const inputFieldClass =
  "w-full rounded-xl border bg-white px-4 py-3 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500";

/** Inline link with underline (body copy) */
export const textLinkUnderlineClass =
  "font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-4 transition hover:text-zinc-950 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:text-zinc-50 dark:hover:decoration-zinc-300";

/** `<strong>` in long-form prose */
export const proseStrongClass =
  "font-medium text-zinc-800 dark:text-zinc-200";

/** Muted foreground link (footnotes, legal) */
export const textLinkMutedClass =
  "font-medium text-zinc-700 underline decoration-zinc-400 underline-offset-4 transition hover:text-zinc-900 hover:decoration-zinc-500 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:decoration-zinc-400";

/** Larger intro line under auth / panel titles */
export const introLeadClass =
  "text-lg leading-relaxed text-zinc-600 dark:text-zinc-400";

/** Standout one-liner (e.g. price under a card title) */
export const bodyEmphasisClass =
  "text-lg font-medium text-zinc-900 dark:text-zinc-100";

/** Footer / ancillary sentence */
export const ancillaryClass =
  "text-center text-sm text-zinc-600 dark:text-zinc-400";
