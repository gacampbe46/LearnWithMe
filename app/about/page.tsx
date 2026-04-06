import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why learnwithme",
  description:
    "Monetizing instructional content is hard: learnwithme explores packaged programs—subscriptions, tiered pricing, a shareable link—so teachers can earn from structured teaching, not only 1:1 hours, ad revenue, or the algorithm.",
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

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-900">Overview</h2>
            <div className="space-y-4 text-base leading-relaxed text-neutral-600">
              <p>
                <strong className="font-medium text-neutral-800">
                  Monetizing instructional content is difficult
                </strong>
                , no matter what you teach. A huge share of tools and habits still
                assume a{" "}
                <strong className="font-medium text-neutral-800">1:1 model</strong>
                : bespoke attention for each buyer. That can work well for
                learners, but it{" "}
                <strong className="font-medium text-neutral-800">
                  doesn&apos;t scale cleanly
                </strong>
                — more income usually means{" "}
                <strong className="font-medium text-neutral-800">
                  more clients, more calendar, and more admin
                </strong>
                . It also pushes toward{" "}
                <strong className="font-medium text-neutral-800">
                  inconsistency
                </strong>
                , because everyone gets something slightly different and there is
                rarely one clear &quot;product&quot; you can improve and sell at
                scale.
              </p>
              <p>
                At the other extreme, big consumer platforms showed that{" "}
                <strong className="font-medium text-neutral-800">
                  one-to-many delivery
                </strong>{" "}
                — the same structured program for a wide audience — can support
                real revenue when the offer is tight and repeatable. Most
                independents still lack a simple way to run that pattern{" "}
                <em>on their own terms</em>: their pricing, their link, and a
                direct relationship with people who already follow their work.
              </p>
              <p>
                Put those two patterns side by side and the usual playbook can feel{" "}
                <strong className="font-medium text-neutral-800">
                  backwards
                </strong>
                : growth is pegged to how many people you personally carry, when
                it could be pegged to{" "}
                <strong className="font-medium text-neutral-800">
                  one packaged program
                </strong>{" "}
                — video, schedules, and supporting materials — that subscribers{" "}
                <strong className="font-medium text-neutral-800">
                  follow on their own time
                </strong>
                , for a{" "}
                <strong className="font-medium text-neutral-800">
                  predictable subscription
                </strong>
                . That shape is what{" "}
                <span className="font-medium text-neutral-800">learnwithme</span>{" "}
                exists to explore.
              </p>
              <p>
                The idea applies across domains — fitness, crafts, language,
                creative skills, anything you teach on camera. Anyone building an
                audience around a{" "}
                <strong className="font-medium text-neutral-800">
                  skill or craft
                </strong>{" "}
                on social should have a credible path to{" "}
                <strong className="font-medium text-neutral-800">
                  monetize that attention
                </strong>{" "}
                with a real program, not only ad payouts, tips, or an endless
                stream of DMs. We&apos;re prototyping with fitness first because it
                makes the contrast obvious; the underlying pattern is meant to
                generalize.
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
                From the creator side
              </h2>
              <p className="text-base leading-relaxed text-neutral-600">
                A{" "}
                <strong className="font-medium text-neutral-800">
                  shareable link
                </strong>{" "}
                in a social bio — a clear home for your teaching brand and a way
                to attract subscribers.{" "}
                <strong className="font-medium text-neutral-800">
                  Tiered pricing
                </strong>{" "}
                can reflect how hands-on you want to be with different people.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-neutral-900">
                From the learner side
              </h2>
              <p className="text-base leading-relaxed text-neutral-600">
                As simple as opening an app or site, landing on the creator&apos;s
                program, and following along with{" "}
                <strong className="font-medium text-neutral-800">
                  video and structured guidance
                </strong>
                — a path, not a loose feed or random playlist.
              </p>
            </div>
          </section>

          <section className="space-y-3 border-t border-neutral-200 pt-8">
            <h2 className="text-xl font-semibold text-neutral-900">
              This prototype
            </h2>
            <p className="text-base leading-relaxed text-neutral-600">
              This page is the same question we&apos;d ask any teacher in
              conversation: does a platform shaped like this{" "}
              <strong className="font-medium text-neutral-800">
                fit how you want to monetize what you teach
              </strong>{" "}
              better than living entirely in 1:1 tools or a public feed alone? The
              sample you can click through is fitness; the same shape should work
              for any instructional content you put on video and promote to a
              social following.
            </p>
            <p className="text-base leading-relaxed text-neutral-600">
              If it resonates, we&apos;d love to hear what would make a platform
              like this something you&apos;d actually use — and what your learners
              would need to trust it.
            </p>
          </section>

          <p>
            <Link
              href="/kathleen"
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
