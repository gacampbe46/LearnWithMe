import { Button } from "@/components/Button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-16 md:max-w-2xl lg:max-w-3xl lg:px-8 xl:max-w-4xl">
        <div className="space-y-6 lg:space-y-8">
          <p className="text-sm font-medium uppercase tracking-widest text-zinc-500 lg:text-base">
            learnwithme
          </p>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-zinc-100 sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[1.05]">
            Learn from creators you trust
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl lg:text-2xl lg:leading-relaxed">
            Tutorials, courses, and how-tos from creators that resonate with you.
            Teach or learn skills in fitness, sewing, 3D printing, and more —
            all in one place.
          </p>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-3">
            <Button href="/kathleen" className="w-full sm:w-auto sm:shrink-0">
              View sample member
            </Button>
            <Link
              href="/about"
              className="inline-flex min-h-12 items-center text-base font-medium text-zinc-400 underline decoration-zinc-600 underline-offset-4 transition hover:text-zinc-100 hover:decoration-zinc-300 sm:min-h-0"
            >
              Why we&apos;re building this
            </Link>
            <Link
              href="/conduct"
              className="inline-flex min-h-12 items-center text-base font-medium text-zinc-400 underline decoration-zinc-600 underline-offset-4 transition hover:text-zinc-100 hover:decoration-zinc-300 sm:min-h-0"
            >
              Code of conduct
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
