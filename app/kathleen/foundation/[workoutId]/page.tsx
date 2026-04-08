import { ExerciseCard } from "@/components/ExerciseCard";
import { SectionHeader } from "@/components/SectionHeader";
import { WorkoutStickyNav } from "@/components/WorkoutStickyNav";
import { KATHLEEN_MEMBER } from "@/data/member";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ workoutId: string }>;
};

export function generateStaticParams() {
  const p = KATHLEEN_MEMBER.program;
  return p.workouts.map((w) => ({ workoutId: w.id }));
}

export default async function WorkoutDayPage({ params }: PageProps) {
  const { workoutId } = await params;
  const t = KATHLEEN_MEMBER;
  const p = t.program;
  const workout = p.workouts.find((w) => w.id === workoutId);

  if (!workout) {
    notFound();
  }

  const exerciseIds = workout.exercises.map((e) => e.id);
  const finishHref = `/${t.slug}/${p.id}`;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 pb-32">
        <div className="space-y-16">
          <nav>
            <Link
              href={finishHref}
              className="text-sm font-medium text-zinc-500 transition hover:text-zinc-100"
            >
              ← {p.title}
            </Link>
          </nav>

          <SectionHeader
            title={workout.title}
            subtitle={workout.description}
          />

          <div className="space-y-20">
            {workout.exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </div>
      </main>

      <WorkoutStickyNav exerciseIds={exerciseIds} finishHref={finishHref} />
    </div>
  );
}
