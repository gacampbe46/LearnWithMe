import { ExerciseCard } from "@/components/ExerciseCard";
import { SectionHeader } from "@/components/SectionHeader";
import { WorkoutStickyNav } from "@/components/WorkoutStickyNav";
import { KATHLEEN_INSTRUCTOR } from "@/data/instructor";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function WorkoutDayPage() {
  const t = KATHLEEN_INSTRUCTOR;
  const p = t.program;
  const workout = p.workouts.find((w) => w.id === "day-1");

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
              className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
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
