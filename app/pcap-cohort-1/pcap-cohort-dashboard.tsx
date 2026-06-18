import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ProfileAvatar } from "@/components/profile-avatar";
import type { PcapCohortState } from "@/lib/pcap-cohort-1/cohort-data";
import { PCAP_COHORT_PATH, pcapCohort, pcapQuiz } from "@/lib/pcap-cohort-1/quiz-data";
import {
  bodyMutedClass,
  bodyStrongClass,
  captionClass,
  titleCardClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";
import Link from "next/link";

type Props = {
  state: PcapCohortState;
};

function completionLabel(completed: number, total: number): string {
  if (total === 0) return "No members yet";
  return `${completed} of ${total} member${total === 1 ? "" : "s"} completed the quiz`;
}

export function PcapCohortDashboard({ state }: Props) {
  const completedCount = state.submissions.length;
  const currentComplete = Boolean(state.currentSubmission);
  const helpCount = Object.values(state.helpRequestsByQuestion).reduce(
    (sum, requests) => sum + requests.length,
    0,
  );
  const discussionCount = Object.values(state.discussionsByQuestion).reduce(
    (sum, posts) => sum + posts.length,
    0,
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={bodyMutedClass}>Cohort dashboard</p>
          <h2 className={titleSubsectionClass}>{pcapCohort.name}</h2>
        </div>
        <Link href={`${PCAP_COHORT_PATH}/about`} className="text-sm font-medium text-stone-700 underline decoration-editorial-accent-muted underline-offset-4 dark:text-stone-300">
          About this cohort
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <Card className="space-y-1">
          <p className={captionClass}>Members</p>
          <p className={bodyStrongClass}>{state.members.length}</p>
        </Card>
        <Card className="space-y-1">
          <p className={captionClass}>Question help signals</p>
          <p className={bodyStrongClass}>{helpCount}</p>
        </Card>
        <Card className="space-y-1">
          <p className={captionClass}>Question discussion posts</p>
          <p className={bodyStrongClass}>{discussionCount}</p>
        </Card>
      </section>

      <Card className="space-y-4">
        <div className="space-y-1">
          <h3 className={titleCardClass}>Who&apos;s here</h3>
          <p className={bodyMutedClass}>
            These are real cohort members. The experiment is whether seeing each
            other&apos;s answers makes it easier to ask for help and explain concepts.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {state.members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center gap-3 rounded-xl border border-editorial-border bg-stone-50/70 p-3 dark:bg-stone-900/30"
            >
              <ProfileAvatar
                name={member.name}
                imageUrl={member.avatarUrl}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-50">
                  {member.name}
                  {member.isCurrentUser ? " (you)" : ""}
                </p>
                <p className={captionClass}>
                  {state.submissions.some((s) => s.userId === member.userId)
                    ? "Completed quiz 1"
                    : "Joined cohort"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="space-y-1">
          <h3 className={titleCardClass}>{pcapQuiz.title}</h3>
          <p className={bodyMutedClass}>{pcapQuiz.description}</p>
          <p className={captionClass}>
            {completionLabel(completedCount, state.members.length)}
            {currentComplete ? " · Quiz 1 of 1 complete" : ""}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            href={`${PCAP_COHORT_PATH}?view=quiz`}
            className="w-full sm:w-auto"
          >
            {currentComplete ? "Retake Quiz" : "Start Quiz"}
          </Button>
          {currentComplete ? (
            <Button
              href={`${PCAP_COHORT_PATH}?view=results`}
              variant="outline"
              className="w-full sm:w-auto"
            >
              View Social Results
            </Button>
          ) : null}
        </div>
      </Card>

      <Card className="space-y-2">
        <h3 className={titleCardClass}>Where the cohort can help</h3>
        <p className={bodyMutedClass}>
          After the quiz, each question becomes a small discussion space. Mark
          what you need help with, then leave a short question or explanation for
          someone else.
        </p>
        <p className={captionClass}>
          Future quizzes will appear here. For today, the goal is one quiz with
          real answers, real uncertainty, and real peer explanation.
        </p>
      </Card>
    </div>
  );
}
