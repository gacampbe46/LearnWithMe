import { Button } from "@/components/Button";
import { StickyBottomCTA } from "@/components/StickyBottomCTA";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 pb-28">
        <div className="space-y-6">
          <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
            WorkWithMe
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-neutral-900 sm:text-5xl">
            Learn from creators you trust
          </h1>
          <p className="text-lg leading-relaxed text-neutral-600 sm:text-xl">
            Tutorials, courses, and how-tos from creators that resonate with you.
            Teach or learn skills in fitness, sewing, 3D printing, and more —
            all in one place.
          </p>
          <div className="flex flex-row flex-wrap items-center gap-x-5 gap-y-3 pt-4">
            <Button href="/kathleen-chu" className="w-auto shrink-0">
              View Sample Instructor
            </Button>
            <Link
              href="/about"
              className="shrink-0 text-base font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-900 hover:decoration-neutral-900"
            >
              Why we&apos;re building this
            </Link>
          </div>
        </div>
      </main>

      <StickyBottomCTA>
        <Button href="/kathleen-chu" variant="primary" className="min-h-12 flex-1">
          View Sample Instructor
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-12 shrink-0 px-4"
          disabled
          aria-disabled
          title="Coming soon"
        >
          Subscribe
        </Button>
      </StickyBottomCTA>
    </div>
  );
}
