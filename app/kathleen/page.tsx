import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ChannelVideoPreview } from "@/components/ChannelVideoPreview";
import { SectionHeader } from "@/components/SectionHeader";
import { StickyBottomCTA } from "@/components/StickyBottomCTA";
import { KATHLEEN_MEMBER } from "@/data/member";
import Link from "next/link";

export default function KathleenSamplePage() {
  const t = KATHLEEN_MEMBER;
  const programPath = `/${t.slug}/${t.program.id}`;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 pb-28">
        <div className="space-y-12">
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            <Link
              href="/"
              className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
            >
              ← Home
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
            >
              Why this exists
            </Link>
            <Link
              href="/design"
              className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
            >
              Design principles
            </Link>
            <Link
              href="/conduct"
              className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
            >
              Code of conduct
            </Link>
          </nav>

          <header className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
              Member
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">
              {t.name}
            </h1>
            <p className="text-sm text-neutral-500">
              Sample profile — members can offer programs and subscribe to others
              from the same kind of account.
            </p>
            <p className="text-xl font-medium text-neutral-800">{t.tagline}</p>
            <p className="text-lg leading-relaxed text-neutral-600">{t.bio}</p>
          </header>

          {t.whatYouNeed && t.whatYouNeed.length > 0 ? (
            <section className="space-y-4">
              <SectionHeader
                title="What you&apos;ll need"
                subtitle="For the sample videos below"
              />
              <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-neutral-600">
                {t.whatYouNeed.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <ChannelVideoPreview videos={t.featuredPreviewVideos} />

          <p>
            <Link
              href={programPath}
              className="text-base font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-900"
            >
              Open the full program outline
            </Link>
            <span className="mt-1 block text-sm text-neutral-500">
              Subscription checkout is not connected yet; this link is for
              exploring structure and pacing.
            </span>
          </p>

          <Card className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-neutral-900">
                {t.program.title}
              </h2>
              <p className="text-neutral-600">{t.program.subtitle}</p>
            </div>
            <p className="text-lg font-medium text-neutral-900">
              {t.program.price}
            </p>
            <Button href={programPath} className="w-full">
              View program
            </Button>
          </Card>
        </div>
      </main>

      <StickyBottomCTA>
        <Button href={programPath} className="min-h-12 flex-1">
          View program
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
