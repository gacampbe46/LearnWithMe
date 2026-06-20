import type { PcapQuizQuestion } from "@/lib/pcap-cohort-1/quiz-data";
import { bodyMutedClass, captionClass } from "@/lib/ui/typography";
import Link from "next/link";

function LessonReference({
  label,
  reference,
}: {
  label: string;
  reference: PcapQuizQuestion["sourceLesson"];
}) {
  return (
    <p className={captionClass}>
      <span className="font-medium text-stone-800 dark:text-stone-200">
        {label}:{" "}
      </span>
      {reference.href ? (
        <Link
          href={reference.href}
          className="font-medium underline decoration-editorial-accent-muted underline-offset-4"
        >
          {reference.title}
        </Link>
      ) : (
        <span>{reference.title}</span>
      )}
    </p>
  );
}

export function PcapQuestionAttribution({
  question,
}: {
  question: PcapQuizQuestion;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-editorial-border bg-stone-50/70 px-4 py-3 dark:bg-stone-900/30">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-editorial-card px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-editorial-accent">
          Testing Topic
        </span>
        <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">
          {question.primaryTopic}
        </span>
        <span className="rounded-full border border-editorial-border px-2 py-0.5 text-[11px] font-medium text-stone-600 dark:text-stone-300">
          {question.questionRole === "refresher"
            ? "Refresher question"
            : "Current concept"}
        </span>
      </div>
      {question.secondaryTopics.length > 0 ? (
        <p className={bodyMutedClass}>
          Also reinforces: {question.secondaryTopics.join(", ")}
        </p>
      ) : null}
      <div className="space-y-1">
        <LessonReference label="Review lesson" reference={question.sourceLesson} />
        {question.refresherLesson ? (
          <LessonReference
            label="Need a refresher?"
            reference={question.refresherLesson}
          />
        ) : null}
      </div>
    </div>
  );
}
