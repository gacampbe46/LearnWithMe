# Pull request: docs and product alignment

**Tip for reviewers:** You can copy this text into the GitHub PR description box, or just read it here.

## What this change does (plain English)

This update improves **the words on the site**, **the links between pages**, and **team docs** in the repo. It does **not** change the dark look of the site—that is a **different pull request**.

## If you are new to this codebase

- **README** — The main text file at the top of the project on GitHub. It helps people understand what the project is.
- **Markdown** — A simple way to write formatted text (headings, lists, links). Our legal-style pages read `.md` files and show them on the site.
- **`MarkdownDoc`** — One shared React component that turns markdown into HTML so we do not duplicate code.
- **`remark-gfm`** — A small add-on so markdown can include **tables** (like on GitHub).
- **Routes** — URLs such as `/about` or `/design`. Next.js maps them to files under `app/`.

## What we changed

- **README** — Updated so it matches how we talk about the product now.
- **Design principles** — New file `DESIGN_PRINCIPLES.md` and a page at **`/design`** so the team can read our design ideas inside the app.
- **Code of Conduct** — Still at **`/conduct`**, now uses the same markdown helper as design (`MarkdownDoc`) so both stay consistent.
- **Words and links** — Home, About, Kathleen sample profile, program pages, and Conduct: clearer text and better links between pages.
- **Workout footer** — Button labels say **Continue** and **Back to program** so they match the rest of the tone.
- **Weekly recap** — `Weekly Meeting Recaps/2026-04-07.md` is for the team on GitHub only; the running app does not show it.
- **Look of buttons and cards** — We kept the **light** style from `main` (white background style). No dark theme in this PR.

## What we did not change

- No dark mode, no new color theme for the whole site (see the **dark-mode-ui** branch).

## How to check it

1. In a terminal, from the project folder, run: `npm run build`
2. Run the app and click through: home, about, design, conduct, Kathleen, a program, and a workout. Make sure text and links look right.
