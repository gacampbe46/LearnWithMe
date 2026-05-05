# learnwithme

**learnwithme** is a prototype web app exploring how people who teach skills on video can offer **structured, subscription-style programs**—with a shareable link, clear progression, and pricing they control—while still using open platforms (for example YouTube) for discovery.

**Live site:** [learnwithme.fyi](https://learnwithme.fyi)

---

## What this app is

This repository is still an **early product prototype**, now with a Supabase-backed data path for profile/program/session content. It demonstrates:

- A **marketing home** and a **product narrative** (“Why this exists”) describing the problem space and intended direction.
- A **sample member profile** ([`/kathleen`](https://learnwithme.fyi/kathleen)) with preview videos and a **sample program** (“Foundation”), seeded into Supabase for end-to-end testing.

The codebase is meant to communicate **intent and UX shape** to collaborators, teachers, and future contributors. Billing and full account lifecycle are still in progress.

---

## Who it is for

| Audience | Role |
| -------- | ---- |
| **Independent teachers and creators** | People who build an audience around a skill or craft on social or video and want a **calm, owned place** for a paid program—not only one-on-one client work, ad revenue, or algorithmic reach. |
| **Learners** | People who want to **follow a clear path** (video + structure) from someone they already like, instead of only browsing an endless feed. |

**Product assumption:** the same person can be both. The prototype is framed around **one member model**: every account is a **member** who can **offer programs** and **subscribe to programs** from others—teaching and learning are not separate “user types” in the product vision.

---

## Product principles (as reflected in the app)

- **Structured programs** — Video, schedules, and supporting materials in a **sequence** people can follow on their own time.
- **Subscription-shaped revenue** — Steady, transparent pricing for the program (the sample uses placeholder copy such as “$12/month”).
- **Shareable identity** — A **link** suitable for a bio that points to **your** program and brand.
- **Complementary to discovery platforms** — Open video and social are treated as **great for being found**; learnwithme is scoped as a **next step** after someone already wants to commit to a program.

Details and tone match the in-app copy on [`/about`](https://learnwithme.fyi/about).

---

## What’s in the repo (high level)

| Path | Purpose |
| ---- | ------- |
| `app/page.tsx` | Home |
| `app/about/page.tsx` | Why this exists (product story) |
| `app/conduct/page.tsx` | Code of conduct (renders `docs/CODE_OF_CONDUCT.md`) |
| `app/[username]/` | Profile/program/session routes (Supabase-backed) |
| `app/login` | Google sign-in (Supabase Auth) |
| `app/auth/callback` | OAuth code exchange → session cookies |
| `proxy.ts` | Session refresh; see `lib/supabase/update-session.ts` |
| `lib/supabase/`, `lib/auth/` | Supabase clients, safe redirects, nav account |
| `components/auth/`, `components/home/` | Login + Google CTA; home account menu / sign out |
| `lib/member/` | Member profile types, load from Supabase, hub links, layout query |
| `lib/catalog/` | Shared tag catalog (`public.tags`) helpers for interests / program topics |
| `tools/seed-supabase.mjs` | Phase 4 seed script for profile/program/sessions |
| `components/` | Other shared UI (buttons, cards, video, CTAs, …) |

**Redirects in `next.config.ts`:** **`/signup`** → **`/login`**; legacy **`/kathleen-chu`** → **`/kathleen`**.

---

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) v4

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # run production server (after build)
npm run lint    # ESLint
npm run seed:supabase  # seed Kathleen profile/program/sessions into Supabase
```

### Supabase environment

Copy `.env.local.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # seed script only
SEED_PROFILE_USER_ID=       # optional; required if profile row doesn't exist yet
```

The legacy anon key name `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported for local/dev.

### Sign-in (Google + Supabase)

1. **Supabase:** Authentication → Providers → **Google** (client ID/secret from [Google Cloud](https://console.cloud.google.com/)). In Google’s OAuth client, **Authorized redirect URIs** must include Supabase’s callback (`https://<project-ref>.supabase.co/auth/v1/callback`).
2. **Supabase → URL configuration:** **Site URL** = your app origin. **Redirect URLs** must include `http://localhost:3000/auth/callback` and production `https://<domain>/auth/callback`.

[`/signup`](/signup) → [`/login`](/login) via [`next.config.ts`](next.config.ts) (query string preserved). Optional [`?next=`](/login?next=/about) only allows same-origin paths (see `lib/auth/safe-next-path.ts`).

**Profiles:** Link `profile.user_id` to `auth.users.id`; add RLS so users can read/update their row. [`tools/seed-supabase.mjs`](tools/seed-supabase.mjs) supports `SEED_PROFILE_USER_ID` for demo data.

---

## Deployment

The live site is deployed from this repository (for example via [Vercel](https://vercel.com) or your host of choice). Configure the host to run `next build` and serve with `next start`, or use the platform’s Next.js preset.

---

## Community standards

Participation in learnwithme spaces (product, future community features, and project-related channels) is governed by the **[Code of Conduct](docs/CODE_OF_CONDUCT.md)**. The same document is published on the site at [`/conduct`](https://learnwithme.fyi/conduct).

## License and contributions

`"private": true` in `package.json` means this app is not published as an npm package. **License, repository visibility, and contribution rules** are defined by the project maintainer.

For questions about direction or partnerships, use the contact path you maintain for **learnwithme**.
