import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import type { PcapCurriculumState } from "@/lib/pcap-cohort-1/schema-data";
import { PCAP_COHORT_PATH } from "@/lib/pcap-cohort-1/quiz-data";
import {
  bodyMutedClass,
  bodyStrongClass,
  captionClass,
  titleCardClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";
import Link from "next/link";

type Props = {
  curriculum: PcapCurriculumState;
};

function phaseLabel(phase: string): string {
  if (phase === "pcap_core") return "PCAP core";
  if (phase === "readiness") return "Readiness";
  return "Foundation";
}

export function PcapCurriculumDashboard({ curriculum }: Props) {
  const modules = curriculum.modules;
  const lessonCount = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const quizCount = modules.reduce(
    (sum, m) =>
      sum + m.quizzes.length + m.lessons.reduce((s, l) => s + l.quizzes.length, 0),
    0,
  );
  const completedLessons = modules.reduce(
    (sum, m) =>
      sum + m.lessons.filter((l) => l.progressStatus === "completed").length,
    0,
  );

  if (!curriculum.hasSchemaCurriculum) {
    return (
      <Card className="space-y-3">
        <h3 className={titleCardClass}>Curriculum setup pending</h3>
        <p className={bodyMutedClass}>
          The cohort schema is connected, but no published PCAP modules are
          linked to this cohort&apos;s program yet. The original checkpoint quiz
          remains available while curriculum seed data is loaded.
        </p>
        <Button href={`${PCAP_COHORT_PATH}?view=quiz`} variant="outline">
          Open current checkpoint quiz
        </Button>
      </Card>
    );
  }

  const firstOpenLesson = modules.flatMap((m) => m.lessons)[0] ?? null;

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="grid gap-3 sm:grid-cols-3">
        <Card className="space-y-1">
          <p className={captionClass}>Modules</p>
          <p className={bodyStrongClass}>{modules.length}</p>
        </Card>
        <Card className="space-y-1">
          <p className={captionClass}>Lessons</p>
          <p className={bodyStrongClass}>{lessonCount}</p>
        </Card>
        <Card className="space-y-1">
          <p className={captionClass}>Completed lessons</p>
          <p className={bodyStrongClass}>
            {completedLessons}/{lessonCount}
          </p>
        </Card>
      </section>

      <Card className="space-y-4">
        <div className="space-y-1">
          <h3 className={titleCardClass}>June 2026 PCAP curriculum</h3>
          <p className={bodyMutedClass}>
            Short lessons, spiral checkpoints, and cohort discussion designed to
            build toward PCAP readiness.
          </p>
          <p className={captionClass}>
            {quizCount} quiz/checkpoint experience{quizCount === 1 ? "" : "s"}{" "}
            available from the schema.
          </p>
        </div>
        {firstOpenLesson ? (
          <Button
            href={`${PCAP_COHORT_PATH}/modules/${encodeURIComponent(
              modules.find((m) => m.id === firstOpenLesson.moduleId)?.slug ?? "",
            )}/lessons/${encodeURIComponent(firstOpenLesson.slug)}`}
          >
            Start first lesson
          </Button>
        ) : null}
      </Card>

      <section className="space-y-4">
        <h3 className={titleSubsectionClass}>Modules</h3>
        <ul className="grid gap-4 sm:grid-cols-2">
          {modules.map((module) => {
            const completed = module.lessons.filter(
              (lesson) => lesson.progressStatus === "completed",
            ).length;
            return (
              <li key={module.id}>
                <Card className="flex h-full flex-col gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={captionClass}>
                        Module {module.sortOrder + 1}
                      </span>
                      <span className="rounded-full border border-editorial-border px-2 py-0.5 text-[11px] font-medium text-stone-600 dark:text-stone-300">
                        {phaseLabel(module.phase)}
                      </span>
                    </div>
                    <h4 className={titleCardClass}>{module.title}</h4>
                    <p className={bodyMutedClass}>
                      {module.summary || module.objective}
                    </p>
                  </div>
                  <p className={captionClass}>
                    {completed}/{module.lessons.length} lessons complete
                  </p>
                  <p className={captionClass}>
                    {module.completedBy.length} cohort member
                    {module.completedBy.length === 1 ? "" : "s"} marked the
                    module complete
                  </p>
                  <div className="mt-auto">
                    <Link
                      href={`${PCAP_COHORT_PATH}/modules/${module.slug}`}
                      className="text-sm font-medium text-stone-800 underline decoration-editorial-accent-muted underline-offset-4 dark:text-stone-100"
                    >
                      Open module
                    </Link>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
