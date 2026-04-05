import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why WorkWithMe",
  description:
    "1:1 tools don’t scale; YouTube optimizes for views, not outcomes. WorkWithMe explores structured programs instructors own and learners can follow.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 pb-16">
        <nav className="mb-10">
          <Link
            href="/"
            className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
          >
            ← Home
          </Link>
        </nav>

        <article className="space-y-10">
          <header className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
              WorkWithMe
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-neutral-900 sm:text-4xl">
              Why this exists
            </h1>
            <p className="text-lg font-medium leading-snug text-neutral-800">
              Help instructors teach at scale without losing their brand — and
              help learners follow a real program, not an endless feed.
            </p>
          </header>

          <section className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
              In short
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-neutral-700">
              <li>
                <span className="font-medium text-neutral-900">
                  1:1-first tools
                </span>{" "}
                (e.g. Trainerize, Wellhub-style setups) don&apos;t scale cleanly
                and often mean every client gets something slightly different.
              </li>
              <li>
                <span className="font-medium text-neutral-900">YouTube</span>{" "}
                rewards views, watch time, and engagement — not whether someone
                finishes a plan or gets a result.
              </li>
              <li>
                <span className="font-medium text-neutral-900">
                  We&apos;re prototyping
                </span>{" "}
                a middle path: structured programs + video + a shareable link
                instructors own, built around outcomes and progression — not
                only DMs or the algorithm.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-neutral-900">
              Why many coaching tools feel stuck
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-neutral-600">
              <li>
                Built around{" "}
                <strong className="font-medium text-neutral-800">1:1</strong>:
                more revenue often means more clients and more admin, not a
                sharper product.
              </li>
              <li>
                <strong className="font-medium text-neutral-800">
                  Inconsistent delivery
                </strong>{" "}
                — hard to say “this is the program” when everyone gets a custom
                variant.
              </li>
              <li>
                Big consumer brands (Peloton-style) already proved{" "}
                <strong className="font-medium text-neutral-800">
                  one-to-many
                </strong>{" "}
                can work; independents still need a simple way to do that{" "}
                <em>as themselves</em>.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-neutral-900">
              Why YouTube alone is a weak fit for programs
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-neutral-600">
              <li>
                The platform optimizes for{" "}
                <strong className="font-medium text-neutral-800">
                  views, clicks, and interaction
                </strong>{" "}
                — not completion, adherence, or measurable progress.
              </li>
              <li>
                Instructors are nudged toward{" "}
                <strong className="font-medium text-neutral-800">
                  what performs in the feed
                </strong>
                , which isn&apos;t always what&apos;s best for a coherent
                curriculum.
              </li>
              <li>
                Learners get a{" "}
                <strong className="font-medium text-neutral-800">
                  library of videos
                </strong>
                , not necessarily a{" "}
                <strong className="font-medium text-neutral-800">
                  path
                </strong>{" "}
                — easy to bounce, hard to stick to “day 3 of the plan.”
              </li>
              <li>
                Your relationship lives inside{" "}
                <strong className="font-medium text-neutral-800">
                  YouTube&apos;s product and incentives
                </strong>
                , not a focused place built around subscribing to{" "}
                <em>your</em> program.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-neutral-900">
              What we&apos;re betting on
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-neutral-600">
              <li>
                Instructors{" "}
                <strong className="font-medium text-neutral-800">
                  package video, schedules, and materials
                </strong>{" "}
                into something people subscribe to and follow on their own time
                — same core program for every subscriber, clearer to improve
                and sell.
              </li>
              <li>
                Optional tiers later for higher-touch help — without the whole
                business living in 1:1 chat by default.
              </li>
            </ul>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-neutral-900">
                For instructors
              </h2>
              <p className="text-sm leading-relaxed text-neutral-600">
                One shareable link to your page and programs — brand, pricing,
                and positioning you control.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-neutral-900">
                For learners
              </h2>
              <p className="text-sm leading-relaxed text-neutral-600">
                Land on someone you trust, open a structured plan, follow video +
                tips — built around finishing the work, not chasing the next
                recommended clip.
              </p>
            </div>
          </section>

          <section className="space-y-3 border-t border-neutral-200 pt-8">
            <h2 className="text-xl font-semibold text-neutral-900">
              This prototype
            </h2>
            <p className="text-base leading-relaxed text-neutral-600">
              WorkWithMe is early and rough — fitness is the first concrete
              example, but the idea applies to anyone teaching through video and
              progression (fitness, crafts, 3D printing, and more). We&apos;re
              testing whether this model feels closer to how instructors want to
              teach and how people want to learn than 1:1-only tools or a public
              feed alone.
            </p>
            <p className="text-base leading-relaxed text-neutral-600">
              If it resonates, tell us what would make a link like this
              something you&apos;d put in your bio — and what learners would need
              to trust it.
            </p>
          </section>

          <p>
            <Link
              href="/kathleen-chu"
              className="text-base font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-900"
            >
              View the sample instructor page
            </Link>
          </p>
        </article>
      </main>
    </div>
  );
}
