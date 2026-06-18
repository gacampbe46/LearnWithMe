import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ProfileAvatar } from "@/components/profile-avatar";
import type {
  PcapCohortMember,
  PcapCohortState,
} from "@/lib/pcap-cohort-1/cohort-data";
import {
  PCAP_COHORT_PATH,
  pcapQuiz,
  type PcapChoiceId,
} from "@/lib/pcap-cohort-1/quiz-data";
import {
  bodyMutedClass,
  captionClass,
  formLabelClass,
  inputFieldClass,
  inputFocusClass,
  navLinkClass,
  titleCardClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";
import Link from "next/link";
import { postQuestionDiscussion, requestQuestionHelp } from "./actions";

type Props = {
  state: PcapCohortState;
  error?: string;
};

const choiceIds: PcapChoiceId[] = ["A", "B", "C", "D"];

function percent(score: number, total: number): number {
  return Math.round((score / Math.max(total, 1)) * 100);
}

function nameList(members: PcapCohortMember[]): string {
  if (members.length === 0) return "";
  if (members.length === 1) return members[0].name;
  if (members.length === 2) return `${members[0].name} and ${members[1].name}`;
  return `${members.slice(0, -1).map((m) => m.name).join(", ")}, and ${
    members[members.length - 1].name
  }`;
}

function AvatarRow({ members }: { members: PcapCohortMember[] }) {
  if (members.length === 0) {
    return <p className={captionClass}>No one picked this yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {members.map((member) => (
        <span
          key={member.userId}
          className="inline-flex items-center gap-1.5 rounded-full border border-editorial-border bg-editorial-card px-2 py-1 text-xs font-medium text-stone-700 dark:text-stone-200"
        >
          <ProfileAvatar
            name={member.name}
            imageUrl={member.avatarUrl}
            size="sm"
            className="h-5 w-5 text-[10px]"
          />
          {member.name}
          {member.isCurrentUser ? " (you)" : ""}
        </span>
      ))}
    </div>
  );
}

export function PcapQuizResults({ state, error }: Props) {
  const submission = state.currentSubmission;
  if (!submission) {
    return (
      <Card className="space-y-4">
        <h2 className={titleSubsectionClass}>No quiz submission yet</h2>
        <p className={bodyMutedClass}>
          Take the quiz first, then come back to compare answers with the cohort.
        </p>
        <Button href={`${PCAP_COHORT_PATH}?view=quiz`}>Start Quiz</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <nav>
        <Link href={PCAP_COHORT_PATH} className={navLinkClass}>
          ← Back to Cohort
        </Link>
      </nav>

      <Card className="space-y-4">
        <div className="space-y-2">
          <p className={captionClass}>Social results</p>
          <h2 className={titleSubsectionClass}>{pcapQuiz.title}</h2>
          <p className={bodyMutedClass}>
            Your score matters less than the pattern: who chose what, who needs
            help, and where someone can explain the concept.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-editorial-border bg-stone-50/70 p-4 dark:bg-stone-900/30">
            <p className={captionClass}>Your score</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900 dark:text-stone-50">
              {submission.score}/{submission.totalQuestions} ({percent(
                submission.score,
                submission.totalQuestions,
              )}
              %)
            </p>
          </div>
          <div className="rounded-xl border border-editorial-border bg-stone-50/70 p-4 dark:bg-stone-900/30">
            <p className={captionClass}>Cohort average</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900 dark:text-stone-50">
              {state.cohortAveragePercent === null
                ? "No average yet"
                : `${state.cohortAveragePercent}%`}
            </p>
          </div>
        </div>
      </Card>

      {error === "discussion" ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
        >
          Could not save that discussion post. Try again.
        </div>
      ) : null}
      {error === "help" ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
        >
          Could not save your help request. Try again.
        </div>
      ) : null}

      {pcapQuiz.questions.map((question, index) => {
        const selected = submission.answers[question.id];
        const gotCorrect = selected === question.correctChoiceId;
        const buckets = state.answerBucketsByQuestion[question.id];
        const discussions = state.discussionsByQuestion[question.id] ?? [];
        const helpRequests = state.helpRequestsByQuestion[question.id] ?? [];
        const helpMembers = helpRequests
          .map((r) => r.member)
          .filter((m): m is PcapCohortMember => Boolean(m));
        const currentUserNeedsHelp = helpMembers.some((m) => m.isCurrentUser);

        return (
          <article key={question.id} id={question.id} className="scroll-mt-24">
            <Card className="space-y-5">
              <div className="space-y-2">
                <p className={captionClass}>Question {index + 1}</p>
                <h3 className={titleCardClass}>{question.concept}</h3>
                <p className="whitespace-pre-line text-base leading-relaxed text-stone-800 dark:text-stone-200">
                  {question.prompt}
                </p>
                <p
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    gotCorrect
                      ? "bg-emerald-100 text-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-100"
                      : "bg-amber-100 text-amber-950 dark:bg-amber-950/50 dark:text-amber-100"
                  }`}
                >
                  {gotCorrect
                    ? "You got this right"
                    : "You missed this one. This is a good place to ask for help."}
                </p>
              </div>

              <div className="space-y-3">
                {question.choices.map((choice) => {
                  const isCorrect = choice.id === question.correctChoiceId;
                  const isSelected = choice.id === selected;
                  const members = buckets?.[choice.id] ?? [];
                  return (
                    <div
                      key={choice.id}
                      className={`rounded-2xl border p-4 ${
                        isCorrect
                          ? "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/20"
                          : isSelected
                            ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20"
                            : "border-editorial-border bg-stone-50/60 dark:bg-stone-900/30"
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <p className="text-sm leading-relaxed text-stone-800 dark:text-stone-200">
                          <span className="font-semibold">{choice.id}.</span>{" "}
                          {choice.label}
                        </p>
                        <div className="shrink-0 space-x-1 text-right">
                          {isCorrect ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-950 dark:bg-emerald-900 dark:text-emerald-100">
                              Correct
                            </span>
                          ) : null}
                          {isSelected ? (
                            <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-medium text-white dark:bg-stone-100 dark:text-stone-900">
                              Your pick
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <AvatarRow members={members} />
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-editorial-border bg-editorial-card px-4 py-3">
                <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
                  Explanation
                </p>
                <p className={bodyMutedClass}>{question.explanation}</p>
              </div>

              <div className="space-y-3 rounded-2xl border border-editorial-border bg-stone-50/70 p-4 dark:bg-stone-900/30">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
                    Help signal
                  </p>
                  {helpMembers.length > 0 ? (
                    <p className={bodyMutedClass}>
                      {nameList(helpMembers)}{" "}
                      {helpMembers.length === 1 ? "wants" : "want"} help with
                      this concept.
                    </p>
                  ) : (
                    <p className={bodyMutedClass}>
                      No one has asked for help on this concept yet.
                    </p>
                  )}
                </div>
                <form action={requestQuestionHelp}>
                  <input type="hidden" name="question_id" value={question.id} />
                  <input
                    type="hidden"
                    name="return_to"
                    value={`${PCAP_COHORT_PATH}?view=results#${question.id}`}
                  />
                  <Button
                    type="submit"
                    variant={currentUserNeedsHelp ? "outline" : "primary"}
                    className="w-full sm:w-auto"
                    disabled={currentUserNeedsHelp}
                  >
                    {currentUserNeedsHelp
                      ? "Help request added"
                      : "I need help with this concept"}
                  </Button>
                </form>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
                    Discussion
                  </p>
                  <p className={bodyMutedClass}>
                    Ask why an answer works, or leave a short explanation for
                    someone else.
                  </p>
                </div>

                {discussions.length > 0 ? (
                  <div className="space-y-3">
                    {discussions.map((post) => (
                      <div
                        key={post.id}
                        className="flex gap-3 rounded-2xl border border-editorial-border bg-stone-50/70 p-3 dark:bg-stone-900/30"
                      >
                        <ProfileAvatar
                          name={post.member?.name ?? "Member"}
                          imageUrl={post.member?.avatarUrl}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
                            {post.member?.name ?? "Cohort member"}
                          </p>
                          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                            {post.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={captionClass}>
                    No discussion yet. Be the first to ask or explain.
                  </p>
                )}

                <form action={postQuestionDiscussion} className="space-y-2">
                  <input type="hidden" name="question_id" value={question.id} />
                  <input
                    type="hidden"
                    name="return_to"
                    value={`${PCAP_COHORT_PATH}?view=results#${question.id}`}
                  />
                  <label htmlFor={`discussion-${question.id}`} className={formLabelClass}>
                    Add a question or explanation
                  </label>
                  <textarea
                    id={`discussion-${question.id}`}
                    name="body"
                    rows={3}
                    maxLength={1000}
                    required
                    placeholder="Example: I chose B because I thought tuples were mutable. What am I missing?"
                    className={`${inputFieldClass} ${inputFocusClass} resize-y`}
                  />
                  <Button type="submit" variant="outline" className="w-full sm:w-auto">
                    Post to Discussion
                  </Button>
                </form>
              </div>
            </Card>
          </article>
        );
      })}
    </div>
  );
}
