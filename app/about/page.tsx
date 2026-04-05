import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why WorkWithMe",
  description:
    "The problem with 1:1-only coaching tools, why packaged programs scale better, and what we’re building for instructors and learners.",
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
            <p className="text-lg leading-relaxed text-neutral-600">
              We&apos;re exploring a better fit between how instructors want to
              teach at scale and how people actually follow along on their own
              time.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-neutral-900">
              The problem space
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-neutral-600">
              <p>
                A lot of tools for coaches and trainers — platforms in the
                vein of{" "}
                <span className="text-neutral-800">Trainerize</span> or{" "}
                <span className="text-neutral-800">Wellhub</span> — are built
                heavily around a{" "}
                <strong className="font-medium text-neutral-800">1:1</strong>{" "}
                model: the instructor is expected to give each client direct
                time and attention. That creates two pressures.
              </p>
              <p>
                First, it{" "}
                <strong className="font-medium text-neutral-800">
                  doesn&apos;t scale cleanly
                </strong>
                : earning more often means more clients, which means more
                overhead and context switching. Second, it can introduce{" "}
                <strong className="font-medium text-neutral-800">
                  inconsistency
                </strong>
                — different people get slightly different versions of the work,
                which makes it harder to refine one strong program and hard to
                know what &quot;the product&quot; even is.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-neutral-900">
              What tends to scale instead
            </h2>
            <p className="text-base leading-relaxed text-neutral-600">
              The biggest consumer fitness brands — think{" "}
              <span className="text-neutral-800">Peloton</span>-style delivery
              — lean on{" "}
              <strong className="font-medium text-neutral-800">one-to-many</strong>
              : one well-produced experience many people can follow. Everyone
              gets the same core product, which is easier to improve, market,
              and trust. The open question for independent instructors is how to
              get similar leverage{" "}
              <em>without</em> losing their voice, brand, or nuance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-neutral-900">
              The shift we&apos;re betting on
            </h2>
            <p className="text-base leading-relaxed text-neutral-600">
              Instead of only managing clients one-by-one, what if instructors
              could{" "}
              <strong className="font-medium text-neutral-800">
                package instructional video, structured schedules, and supporting
                materials
              </strong>{" "}
              (workout plans today; meal plans, patterns, project files, or
              reading later) into a{" "}
              <strong className="font-medium text-neutral-800">
                subscription people follow on their own time
              </strong>
              ? The same program ships to every subscriber, so quality and
              messaging stay coherent — while optional tiers could still leave
              room for higher-touch offers when the instructor wants that.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-neutral-900">
              For instructors
            </h2>
            <p className="text-base leading-relaxed text-neutral-600">
              A simple, shareable link in a bio or newsletter that points to{" "}
              <em>their</em> page and programs — a home base for a personal
              brand, clearer positioning, and room for tiered pricing if they
              want different levels of access or support.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-neutral-900">
              For learners
            </h2>
            <p className="text-base leading-relaxed text-neutral-600">
              Open the site or app, land on an instructor they resonate with, and
              follow a program with video demos and coaching-style tips — the
              same structured path everyone else in that program gets, on a
              schedule that fits real life.
            </p>
          </section>

          <section className="space-y-3 border-t border-neutral-200 pt-10">
            <h2 className="text-xl font-semibold text-neutral-900">
              What we&apos;re trying to accomplish
            </h2>
            <p className="text-base leading-relaxed text-neutral-600">
              WorkWithMe is an early prototype of that idea — starting with
              fitness as a concrete example (our sample instructor), but aimed at{" "}
              <strong className="font-medium text-neutral-800">
                any instructor
              </strong>{" "}
              who teaches through video and structured progression: fitness,
              sewing, 3D printing, and beyond. We want to validate whether this
              model feels closer to how instructors want to teach and how people
              want to learn than pure 1:1 toolchains alone.
            </p>
            <p className="text-base leading-relaxed text-neutral-600">
              If that resonates, we&apos;d love to hear what would make a link
              like this something you&apos;d actually put in your bio — and what
              your learners would need to trust it.
            </p>
          </section>

          <p className="pt-2">
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
