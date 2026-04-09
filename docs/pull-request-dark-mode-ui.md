# Pull request: dark mode and UI foundation

**GitHub shows this PR with an empty description until you set it.** From the project root, after [`gh auth login`](https://cli.github.com/), run: `./scripts/fill-pr-descriptions.sh` — it copies this file into the PR body. You can also paste this file by hand into the PR on GitHub.

## What this change does (plain English)

This update makes the **whole site use a dark look**: dark background, light text, and matching buttons and cards. It also sets the **browser theme color** (the color around the top bar on some phones) so it matches the dark style.

This PR is based on **today’s `main` branch** for **text and pages**. If your team merges **docs and product alignment** first, you will need to **rebase** this branch and fix a few merge conflicts (same files touched for different reasons).

## If you are new to this codebase

- **`globals.css`** — Global styles for the whole app. Here we set dark background colors and soft background “glow” shapes.
- **`layout.tsx`** — Wraps every page. We add **`themeColor`** for mobile browsers and remove the old white page background from the body (the dark background comes from CSS).
- **Tailwind classes** — Utility class names on HTML elements, like `text-zinc-100` for light text on dark backgrounds.
- **Shared components** — Files like `Button.tsx` and `Card.tsx` are reused on many pages. We updated them once so the whole app matches.

## What we changed

- **Colors and background** — Dark gray / zinc style, not pure black. Subtle gradients so the page feels less flat.
- **Buttons, cards, video placeholders, section titles** — Styles updated so they work on dark backgrounds.
- **Sticky bar** (bottom of some screens) — Frosted dark style so it fits the rest of the UI.
- **Pages** — Text color classes updated from light-theme names to dark-theme names. **Story and links** are still the older `main` version on this branch until you merge with the docs PR.

## What we did not change

- **README**, **design principles file**, **`/design` route**, **MarkdownDoc**, and **big copy edits** — Those live on the **docs-and-product-alignment** branch.

## How to check it

1. In a terminal, from the project folder, run: `npm run build`
2. Run the app and scroll main flows (home, about, conduct, Kathleen, workouts). Check contrast and that nothing is hard to read.
