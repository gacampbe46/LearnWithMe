import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { StickyBottomCTA } from "@/components/StickyBottomCTA";
import { getMemberByUsername } from "@/data/members";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ username: string; programId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username, programId } = await params;
  const member = await getMemberByUsername(username);
  if (!member || member.program.id !== programId) {
    return { title: "Program" };
  }
  return {
    title: `${member.program.title} — ${member.name}`,
    description: member.program.subtitle,
  };
}

export default async function ProgramPage({ params }: PageProps) {
  const { username, programId } = await params;
  const t = await getMemberByUsername(username);

  if (!t || t.program.id !== programId) {
    notFound();
  }

  const p = t.program;
  const first = p.workouts[0];

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 pb-28">
        <div className="space-y-10">
          <nav>
            <Link
              href={`/${t.slug}`}
              className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100"
            >
              ← {t.name}
            </Link>
          </nav>

          <SectionHeader title={p.title} subtitle={p.subtitle} />

          <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            {p.price}
          </p>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-500">
              Workouts
            </h3>
            <ul className="space-y-3">
              {p.workouts.map((w) => (
                <li key={w.id}>
                  <Link href={`/${t.slug}/${p.id}/${w.id}`}>
                    <Card className="transition hover:border-zinc-400 hover:shadow-md active:scale-[0.99] dark:hover:border-zinc-600">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {w.title}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
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
