import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why learnwithme",
  description:
    "One account for teaching and learning. learnwithme is exploring simple programs people can subscribe to—fair pricing, a link for your bio—so earning from what you teach isn’t only one-on-one hours, ads, or hoping the feed shows your work.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 pb-16">
        <nav className="mb-10 flex flex-wrap gap-x-4 gap-y-2">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-100"
          >
            ← Home
          </Link>
          <Link
            href="/conduct"
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-100"
          >
            Code of conduct
          </Link>
        </nav>

        <article className="space-y-10">
          <header className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
              learnwithme
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-100 sm:text-4xl">
              Why we're building this
            </h1>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-100">Overview</h2>
            <div className="space-y-4 text-base leading-relaxed text-zinc-400">
              <p>
                <strong className="font-medium text-zinc-200">
                  Everyone can teach and learn.
                </strong>{" "}
                We didn&apos;t want to split people into two buckets — “only
                teachers” and “only students.”{" "}
                <strong className="font-medium text-zinc-200">
                  Every account is a member
                </strong>
                : you can share programs with others, and you can follow programs
                from others too. Same person, same login; you&apos;re not stuck in
                one role forever.
              </p>
              <p>
                <strong className="font-medium text-zinc-200">
                  Making money from what you teach is genuinely hard
                </strong>
                , in any field. A lot of tools still assume you&apos;ll work{" "}
                <strong className="font-medium text-zinc-200">
                  one-on-one
                </strong>
                , giving each person lots of personal time and custom plans.
                That can be great for the people you help. It also means when you
                want to earn more, you often end up with{" "}
                <strong className="font-medium text-zinc-200">
                  more people to juggle, a fuller calendar, and more busywork
                </strong>
                . Everyone can end up with something a little different, which
                makes it harder to polish{" "}
                <strong className="font-medium text-zinc-200">
                  one clear offer
                </strong>{" "}
                you&apos;re proud to stand behind.
              </p>
              <p>
                Big platforms have also shown that{" "}
                <strong className="font-medium text-zinc-200">
                  one solid program, shared with many people
                </strong>
                , can work when the plan is clear and easy to follow. Many
                independent teachers still don&apos;t have a simple way to do
                that{" "}
                <strong className="font-medium text-zinc-200">
                  under their own name
                </strong>
                : their prices, their link, and a straight line to the people who
                already like what they do online.
              </p>
              <p>
                So we&apos;re curious about another path: what if growth didn&apos;t
                always mean &quot;more hours for you personally,&quot; and instead
                could mean{" "}
                <strong className="font-medium text-zinc-200">
                  one thoughtful program
                </strong>{" "}
                — video, schedules, and extra materials — that people can{" "}
                <strong className="font-medium text-zinc-200">
                  follow on their own schedule
                </strong>{" "}
                for a{" "}
                <strong className="font-medium text-zinc-200">
                  steady monthly subscription
                </strong>
                ? That&apos;s the shape{" "}
                <span className="font-medium text-zinc-200">learnwithme</span>{" "}
                is trying out.
              </p>
              <p>
                The same idea can apply to fitness, crafts, languages, creative
                skills — really anything you show on video. If you&apos;re growing
                a following around a{" "}
                <strong className="font-medium text-zinc-200">
                  skill or craft
                </strong>
                , we think you deserve a fair way to{" "}
                <strong className="font-medium text-zinc-200">
                  turn that interest into income
                </strong>{" "}
                with a real program — not only ad checks, tips, or living in your
                inbox. We started with fitness as our first example because
                it&apos;s easy to picture; we hope the pattern spreads wider over
                time.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-100">
              YouTube is great for getting found — we&apos;re building the next
              step
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-zinc-400">
              <p>
                Lots of us discover teachers on the open web,{" "}
                <span className="font-medium text-zinc-200">YouTube</span>{" "}
                included. That&apos;s a strength: people can sample your style,
                share a clip, and decide they want more. We love that part of the
                internet.
              </p>
              <p>
                Where we saw room to help is after someone already likes you.
                Sometimes they want{" "}
                <strong className="font-medium text-zinc-200">
                  a clear program
                </strong>
                — a start, a middle, and a fair price that supports you — on{" "}
                <strong className="font-medium text-zinc-200">
                  your link, with your rules
                </strong>
                .                 Big video sites and that kind of home serve different jobs.{" "}
                <span className="font-medium text-zinc-200">learnwithme </span> is
                our early draft of that home: a place where &quot;what do I do
                next?&quot; has a simple answer, like &quot;day three is right
                here.&quot;
              </p>
              <p>
                You can still post free videos wherever you already do. We hope
                this sits{" "}
                <strong className="font-medium text-zinc-200">alongside</strong>{" "}
                that — not instead of it. What we&apos;re aiming for is accounts
                where{" "}
                <strong className="font-medium text-zinc-200">
                  people both teach and learn
                </strong>
                , plus programs built around subscriptions and a link that fits in
                your bio, so fans have a calm spot to sign up and you can point to
                one clear home for your paid work.
              </p>
            </div>
          </section>

          <section className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-100">
                When you teach
              </h2>
              <p className="text-base leading-relaxed text-zinc-400">
                Same member account — a{" "}
                <strong className="font-medium text-zinc-200">
                  shareable link
                </strong>{" "}
                in your bio, a home for what you offer, and a way to attract
                subscribers.{" "}
                <strong className="font-medium text-zinc-200">
                  Tiered pricing
                </strong>{" "}
                can reflect how hands-on you want to be with different people.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-100">
                When you learn
              </h2>
              <p className="text-base leading-relaxed text-zinc-400">
                Same member account — open the app or site, land on someone
                else&apos;s program, and follow along with{" "}
                <strong className="font-medium text-zinc-200">
                  video and structured guidance
                </strong>
                — a clear path, built for sticking with a program start to finish.
              </p>
            </div>
          </section>

          <section className="space-y-3 border-t border-zinc-800 pt-8">
            <h2 className="text-xl font-semibold text-zinc-100">
              This prototype
            </h2>
            <p className="text-base leading-relaxed text-zinc-400">
              If we sat down with you, we&apos;d ask: does a setup like this feel
              closer to how you want to{" "}
              <strong className="font-medium text-zinc-200">
                earn from what you teach
              </strong>{" "}
              and{" "}
              <strong className="font-medium text-zinc-200">
                find things you want to learn
              </strong>{" "}
              than juggling only one-on-one tools or only public feeds? The demo
              here is fitness, but we imagine the same idea for any skill you share
              on video and grow with a social following.
            </p>
            <p className="text-base leading-relaxed text-zinc-400">
              If any of this clicks with you, we&apos;d genuinely like to hear what
              would make you want to use it — and what would help the people who
              pay you feel safe and excited to stay.
            </p>
          </section>

          <p>
            <Link
              href="/kathleen"
              className="text-base font-medium text-zinc-100 underline decoration-zinc-600 underline-offset-4 transition hover:decoration-zinc-300"
            >
              View a sample member profile
            </Link>
          </p>
        </article>
      </main>
    </div>
  );
}
