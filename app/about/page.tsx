import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why learnwithme",
  description:
    "One-to-many learning isn’t only for fitness: learnwithme explores packaged programs—subscriptions, tiered pricing, a shareable link—so anyone showcasing a skill or craft on social can monetize that audience, not just grind 1:1 or the algorithm.",
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
                A lot of trainers deliver through platforms in the vein of{" "}
                <span className="font-medium text-neutral-800">Trainerize</span>{" "}
                or <span className="font-medium text-neutral-800">Wellhub</span>.
                Those products are mostly built around a{" "}
                <strong className="font-medium text-neutral-800">1:1 model</strong>
                : the trainer is expected to give each individual client their time
                and attention. That{" "}
                <strong className="font-medium text-neutral-800">
                  doesn&apos;t scale well
                </strong>
                — to make more money you usually need to take on{" "}
                <strong className="font-medium text-neutral-800">
                  more clients
                </strong>
                , which means <strong className="font-medium text-neutral-800">more work</strong>. It
                also introduces{" "}
                <strong className="font-medium text-neutral-800">
                  inconsistency
                </strong>
                , since each client receives something slightly different.
              </p>
              <p>
                The most successful fitness platforms at scale —{" "}
                <span className="font-medium text-neutral-800">Peloton</span> is
                the familiar example — are built around{" "}
                <strong className="font-medium text-neutral-800">
                  one-to-many delivery
                </strong>
                : the same product can be shared across a wide audience. Everyone
                gets the same, well-produced program.
              </p>
              <p>
                Set those two patterns next to each other and a question appears:
                we may have had{" "}
                <strong className="font-medium text-neutral-800">
                  the default playbook backwards
                </strong>
                . Instead of optimizing for how closely a trainer manages each
                person, the opportunity may be to{" "}
                <strong className="font-medium text-neutral-800">
                  package workout videos, training schedules, and meal plans
                </strong>{" "}
                into a{" "}
                <strong className="font-medium text-neutral-800">
                  subscription-based
                </strong>{" "}
                experience people{" "}
                <strong className="font-medium text-neutral-800">
                  follow on their own time
                </strong>
                . That packaged-subscription shape is what{" "}
                <span className="font-medium text-neutral-800">learnwithme</span>{" "}
                exists to explore.
              </p>
              <p>
                In thinking through this problem space, we also realized the same
                idea —{" "}
                <strong className="font-medium text-neutral-800">
                  one-to-many learning
                </strong>{" "}
                — applies well beyond fitness training. Anyone who has a{" "}
                <strong className="font-medium text-neutral-800">
                  skill or craft
                </strong>{" "}
                they showcase on social media should be able to{" "}
                <strong className="font-medium text-neutral-800">
                  monetize that audience
                </strong>
                : a clear program people can buy into, not only ad revenue,
                tips, or endless DMs. Fitness is the first vertical we&apos;re
                prototyping because the contrast with 1:1 tooling is sharp; the
                underlying pattern is meant to generalize.
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
              <p className="text-base leading-relaxed text-neutral-600">
                A{" "}
                <strong className="font-medium text-neutral-800">
                  shareable link
                </strong>{" "}
                that lives in a social media bio — a home for your training brand
                and a way to attract new subscribers.{" "}
                <strong className="font-medium text-neutral-800">
                  Tiered pricing models
                </strong>{" "}
                could reflect how involved you want to be with different clients.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-neutral-900">
                From the user side
              </h2>
              <p className="text-base leading-relaxed text-neutral-600">
                As simple as opening an app, going to their trainer&apos;s page or
                workout plan, and following workouts with the aid of{" "}
                <strong className="font-medium text-neutral-800">
                  video demos and coaching tips
                </strong>
                — structured as a program, not a loose feed or playlist.
              </p>
            </div>
          </section>

          <section className="space-y-3 border-t border-neutral-200 pt-8">
            <h2 className="text-xl font-semibold text-neutral-900">
              This prototype
            </h2>
            <p className="text-base leading-relaxed text-neutral-600">
              This page is the same question we&apos;d ask a trainer in
              conversation: does a platform shaped like this{" "}
              <strong className="font-medium text-neutral-800">
                better align with how you want to train people going forward
              </strong>{" "}
              than living entirely in 1:1 tools or a public feed alone? The
              sample you can click through is fitness; the same shape should work
              for any skill or craft you teach on video and promote to a social
              following.
            </p>
            <p className="text-base leading-relaxed text-neutral-600">
              If it resonates, we&apos;d love to hear what would make a platform
              like this something you&apos;d actually use — and what your clients
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
