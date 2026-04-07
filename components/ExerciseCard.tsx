import { SectionHeader } from "./SectionHeader";
import { VideoEmbed } from "./VideoEmbed";
import type { Exercise } from "@/data/member";

type ExerciseCardProps = {
  exercise: Exercise;
  className?: string;
};

export function ExerciseCard({ exercise, className = "" }: ExerciseCardProps) {
  return (
    <article
      className={`space-y-5 scroll-mt-24 ${className}`.trim()}
      id={exercise.id}
    >
      <SectionHeader title={exercise.title} />
      <VideoEmbed videoId={exercise.videoId} title={exercise.title} />
      <p className="text-lg font-medium text-neutral-900">{exercise.setsReps}</p>
      <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-neutral-600">
        {exercise.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </article>
  );
}
