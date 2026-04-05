import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why learnwithme",
  description:
    "1:1 tools don’t scale; YouTube optimizes for views, not outcomes. learnwithme explores structured programs instructors own and learners can follow.",
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
              learnwithme
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-neutral-900 sm:text-4xl">
              Why this exists
            </h1>
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

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-900">
              What we&apos;ve been seeing
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-neutral-600">
              <p>
                A lot of trainers deliver through platforms in the vein of{" "}
                <span className="font-medium text-neutral-800">Trainerize</span>{" "}
                or <span className="font-medium text-neutral-800">Wellhub</span>.
                Those products skew heavily toward a{" "}
                <strong className="font-medium text-neutral-800">1:1</strong>{" "}
                model: the trainer is expected to give each client individual time
                and attention. That doesn&apos;t scale cleanly — to make more
                money you usually take on more clients, which means more work.
                It can also introduce{" "}
                <strong className="font-medium text-neutral-800">
                  inconsistency
                </strong>
                , because each person ends up with something slightly different.
              </p>
              <p>
                The biggest consumer fitness brands — think{" "}
                <span className="font-medium text-neutral-800">Peloton</span>
                -style products — lean the other way:{" "}
                <strong className="font-medium text-neutral-800">
                  one-to-many
                </strong>{" "}
                delivery. The same well-produced experience goes out to a wide
                audience; everyone gets the same core product.
              </p>
              <p>
                That contrast made us ask whether the usual playbook is backwards.
                Instead of only managing clients one-on-one, what if trainers
                could{" "}
                <strong className="font-medium text-neutral-800">
                  package workout videos, training schedules, and meal plans
                </strong>{" "}
                into a{" "}
                <strong className="font-medium text-neutral-800">
                  subscription people follow on their own time
                </strong>
                ? Same program for every subscriber — easier to improve, explain,
                and stand behind — while optional tiers could still leave room for
                more hands-on help when the trainer wants that.
              </p>
            </div>
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

          <section className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-neutral-900">
                From the trainer side
              </h2>
              <p className="text-sm leading-relaxed text-neutral-600">
                A <strong className="font-medium text-neutral-800">shareable link</strong>{" "}
                that lives in a social bio (or anywhere you send people) — a clear
                home for your training brand and a way to attract subscribers.{" "}
                <strong className="font-medium text-neutral-800">
                  Tiered pricing
                </strong>{" "}
                could reflect how involved you want to be with different clients.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-neutral-900">
                From the user side
              </h2>
              <p className="text-sm leading-relaxed text-neutral-600">
                As simple as opening the app or site, going to their trainer&apos;s
                page or workout plan, and following along with{" "}
                <strong className="font-medium text-neutral-800">
                  video demos and coaching tips
                </strong>{" "}
                — structured like a program, not a random playlist.
              </p>
            </div>
          </section>

          <section className="space-y-3 border-t border-neutral-200 pt-8">
            <h2 className="text-xl font-semibold text-neutral-900">
              This prototype
            </h2>
            <p className="text-base leading-relaxed text-neutral-600">
              learnwithme is a rough early version of that idea — we&apos;re
              starting with fitness as the example you can click through, but the
              same shape could apply to other skills you teach on video. We want
              to know whether this feels closer to how you want to train people
              going forward than living entirely in 1:1 tools or a public feed
              alone.
            </p>
            <p className="text-base leading-relaxed text-neutral-600">
              If it resonates, we&apos;d love to hear what would make a platform
              like this something you&apos;d actually use — and what your clients
              would need to trust it.
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
