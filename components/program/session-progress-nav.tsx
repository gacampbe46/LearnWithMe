"use client";

import { unmarkSessionCompleted } from "@/lib/program/session-progress";
import { useCompletedSessions } from "@/lib/program/use-completed-sessions";
import Link from "next/link";

type Step = {
  id: string;
  href: string;
  label: string;
};

type Props = {
  programId: string;
  currentSessionId?: string;
  steps: Step[];
};

export function SessionProgressNav({
  programId,
  currentSessionId,
  steps,
}: Props) {
  const completed = useCompletedSessions(programId);
  if (steps.length < 2) return null;

  const currentIndex = currentSessionId
    ? steps.findIndex((s) => s.id === currentSessionId)
    : -1;
  const doneCount = steps.filter((s) => completed.has(s.id)).length;

  return (
    <nav aria-label="Program sessions" className="space-y-2">
      <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
        {doneCount} of {steps.length} complete
      </p>
      <ol className="flex flex-wrap gap-1.5">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentSessionId;
          const isDone = completed.has(step.id);
          const n = index + 1;
          const title = isDone
            ? `Mark ${step.label} incomplete`
            : isCurrent
              ? `${step.label} (current)`
              : step.label;

          const circleClass = `flex size-8 items-center justify-center rounded-full text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-editorial-accent-muted ${
            isCurrent
              ? "bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900"
              : isDone
                ? "bg-editorial-accent-muted/40 text-stone-800 hover:bg-editorial-accent-muted/70 dark:text-stone-100"
                : "border border-editorial-border text-stone-500 hover:border-editorial-accent-muted hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
          }`;

          return (
            <li key={step.id}>
              {isDone ? (
                <button
                  type="button"
                  title={title}
                  aria-label={title}
                  className={circleClass}
                  onClick={() => unmarkSessionCompleted(programId, step.id)}
                >
                  <CheckIcon />
                </button>
              ) : (
                <Link
                  href={step.href}
                  title={title}
                  aria-label={title}
                  aria-current={isCurrent ? "step" : undefined}
                  className={circleClass}
                >
                  {n}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      {currentIndex >= 0 ? (
        <span className="sr-only">
          Session {currentIndex + 1} of {steps.length}
        </span>
      ) : null}
    </nav>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      className="size-3.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
    </svg>
  );
}
