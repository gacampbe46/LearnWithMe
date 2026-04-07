import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { StickyBottomCTA } from "@/components/StickyBottomCTA";
import { KATHLEEN_MEMBER } from "@/data/member";
import Link from "next/link";

export default function ProgramPage() {
  const t = KATHLEEN_MEMBER;
  const p = t.program;
  const first = p.workouts[0];

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 pb-28">
        <div className="space-y-10">
          <nav>
            <Link
              href={`/${t.slug}`}
              className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
            >
              ← {t.name}
            </Link>
          </nav>

          <SectionHeader title={p.title} subtitle={p.subtitle} />

          <p className="text-lg font-medium text-neutral-900">{p.price}</p>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
              Workouts
            </h3>
            <ul className="space-y-3">
              {p.workouts.map((w) => (
                <li key={w.id}>
                  <Link href={`/${t.slug}/${p.id}/${w.id}`}>
                    <Card className="transition hover:border-neutral-300 hover:shadow-md active:scale-[0.99]">
                      <p className="font-semibold text-neutral-900">
                        {w.title}
                      </p>
                      <p className="mt-1 text-sm text-neutral-600">
                        {w.description}
                      </p>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <StickyBottomCTA>
        <Button
          href={`/${t.slug}/${p.id}/${first?.id ?? "day-1"}`}
          className="min-h-12 w-full max-w-sm"
        >
          Start Workout
        </Button>
      </StickyBottomCTA>
    </div>
  );
}
