import { ExerciseCard } from "@/components/ExerciseCard";
import { SectionHeader } from "@/components/SectionHeader";
import { WorkoutStickyNav } from "@/components/WorkoutStickyNav";
import { getMemberByUsername } from "@/data/members";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ username: string; programId: string; workoutId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username, programId, workoutId } = await params;
  const member = await getMemberByUsername(username);
  const workout = member?.program.workouts.find((w) => w.id === workoutId);
  if (!member || member.program.id !== programId || !workout) {
    return { title: "Workout" };
  }
  return {
    title: `${workout.title} — ${member.name}`,
    description: workout.description,
  };
}

export default async function WorkoutDayPage({ params }: PageProps) {
  const { username, programId, workoutId } = await params;
  const t = await getMemberByUsername(username);

  if (!t || t.program.id !== programId) {
    notFound();
  }

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
              className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100"
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
