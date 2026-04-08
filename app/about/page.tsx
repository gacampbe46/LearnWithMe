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
          <Link
            href="/design"
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-100"
          >
            Design principles
          </Link>
        </nav>

        <article className="space-y-10">
          <header className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
              learnwithme
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-100 sm:text-4xl">
              Why we&apos;re building this
            </h1>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-100">Overview</h2>
            <div className="space-y-4 text-base leading-relaxed text-zinc-400">
              <p>
                Everyone can teach and learn. We didn&apos;t want to split people
                into two buckets — &quot;only teachers&quot; and &quot;only
                students.&quot; Every account is a member: you can share programs
                with others, and you can follow programs from others too. Same
                person, same login; you&apos;re not stuck in one role forever.
              </p>
              <p>
                Making money from what you teach is genuinely hard, in any field.
                A lot of tools still assume you&apos;ll work one-on-one, giving
                each person lots of personal time and custom plans. That can be
                great for the people you help. It also means when you want to earn
                more, you often end up with more people to juggle, a fuller
                calendar, and more busywork. Everyone can end up with something a
                little different, which makes it harder to polish one clear offer
                you&apos;re proud to stand behind.
              </p>
              <p>
                Big platforms have also shown that one solid program, shared with
                many people, can work when the plan is clear and easy to follow.
                Many independent teachers still don&apos;t have a simple way to do
                that under their own name: their prices, their link, and a straight
                line to the people who already like what they do online.
              </p>
              <p>
                So we&apos;re curious about another path: what if growth didn&apos;t
                always mean &quot;more hours for you personally,&quot; and instead
                could mean one thoughtful program — video, schedules, and extra
                materials — that people can follow on their own schedule for a
                steady monthly subscription? That&apos;s the shape learnwithme is
                trying out.
              </p>
              <p>
                The same idea can apply to fitness, crafts, languages, creative
                skills — really anything you show on video. If you&apos;re growing
                a following around a skill or craft, we think you deserve a fair way
                to turn that interest into income with a real program — not only ad
                checks, tips, or living in your inbox. We started with fitness as
                our first example because it&apos;s easy to picture; we hope the
                pattern spreads wider over time.
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
                Lots of us discover teachers on the open web, YouTube included.
                That&apos;s a strength: people can sample your style, share a clip,
                and decide they want more. We love that part of the internet.
              </p>
              <p>
                Where we saw room to help is after someone already likes you.
                Sometimes they want a clear program — a start, a middle, and a
                fair price that supports you — on your link, with your rules. Big
                video sites and that kind of home serve different jobs.{" "}
                <span className="font-medium text-zinc-200">learnwithme</span>{" "}
                is our early draft of that home: a place where &quot;what do I do
                next?&quot; has a simple answer, like &quot;day three is right
                here.&quot;
              </p>
              <p>
                You can still post free videos wherever you already do. We hope
                this sits alongside that — not instead of it. What we&apos;re aiming
                for is accounts where people both teach and learn, plus programs
                built around subscriptions and a link that fits in your bio, so
                fans have a calm spot to sign up and you can point to one clear
                home for your paid work.
              </p>
            </div>
          </section>

          <section className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-100">
                When you teach
              </h2>
              <p className="text-base leading-relaxed text-zinc-400">
                Same member account — a shareable link in your bio, a home for what
                you offer, and a way to attract subscribers. Tiered pricing can
                reflect how hands-on you want to be with different people.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-100">
                When you learn
              </h2>
              <p className="text-base leading-relaxed text-zinc-400">
                Same member account — open the app or site, land on someone
                else&apos;s program, and follow along with video and structured
                guidance. The layout is meant for sticking with a program from
                start to finish, not for endless browsing.
              </p>
            </div>
          </section>

          <section className="space-y-3 border-t border-zinc-800 pt-8">
            <h2 className="text-xl font-semibold text-zinc-100">
              This prototype
            </h2>
            <p className="text-base leading-relaxed text-zinc-400">
              If we sat down with you, we&apos;d ask: does a setup like this feel
              closer to how you want to earn from what you teach and find things
              you want to learn than juggling only one-on-one tools or only public
              feeds? The demo here is fitness, but we imagine the same idea for any
              skill you share on video and grow with a social following.
            </p>
            <p className="text-base leading-relaxed text-zinc-400">
              If any of this resonates, we&apos;d like to hear what would make you
              want to use it — and what would help the people who pay you feel safe
              and comfortable staying.
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
