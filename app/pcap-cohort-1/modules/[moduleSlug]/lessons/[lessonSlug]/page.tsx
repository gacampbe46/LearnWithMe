import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { loadPcapCurriculumState } from "@/lib/pcap-cohort-1/schema-data";
import { PCAP_COHORT_PATH } from "@/lib/pcap-cohort-1/quiz-data";
import { pageMainClass } from "@/lib/ui/page-layout";
import {
  bodyMutedClass,
  captionClass,
  navLinkClass,
  titleCardClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { PcapLessonContent } from "../../../../pcap-lesson-content";
import { PcapRunnablePythonBlock } from "../../../../pcap-runnable-python-block";
import {
  markCurriculumLessonComplete,
  postCurriculumDiscussionMessage,
  requestAiLiferaft,
  submitCurriculumQuestionAttempt,
} from "../../../../actions";

type PageProps = {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
};

type Choice = {
  id?: unknown;
  label?: unknown;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lessonSlug } = await params;
  const curriculum = await loadPcapCurriculumState();
  const lesson = curriculum.lessonBySlug.get(lessonSlug);
  return {
    title: lesson ? `${lesson.title} — PCAP Cohort` : "PCAP Lesson",
    description: lesson?.summary ?? lesson?.objective,
  };
}

function normalizedChoices(value: unknown[]): { id: string; label: string }[] {
  return value
    .map((choice): { id: string; label: string } | null => {
      const c = choice as Choice;
      const id = typeof c.id === "string" ? c.id : "";
      const label = typeof c.label === "string" ? c.label : "";
      if (!id || !label) return null;
      return { id, label };
    })
    .filter((choice): choice is { id: string; label: string } => Boolean(choice));
}

export default async function PcapLessonPage({ params }: PageProps) {
  const { moduleSlug, lessonSlug } = await params;
  const curriculum = await loadPcapCurriculumState();
  const currentModule = curriculum.moduleBySlug.get(moduleSlug);
  const lesson = curriculum.lessonBySlug.get(lessonSlug);

  if (
    !curriculum.cohort ||
    !currentModule ||
    !lesson ||
    lesson.moduleId !== currentModule.id
  ) {
    notFound();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className={`${pageMainClass} space-y-8`}>
        <nav className="space-y-2">
          <Link
            href={`${PCAP_COHORT_PATH}/modules/${currentModule.slug}`}
            className={navLinkClass}
          >
            ← {currentModule.title}
          </Link>
        </nav>

        <SectionHeader
          eyebrow={`${lesson.estimatedMinutes} minute lesson`}
          title={lesson.title}
          subtitle={lesson.summary || lesson.objective}
        />

        {lesson.topics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {lesson.topics.map((topic) => (
              <span
                key={topic.id}
                className="rounded-full border border-editorial-border px-3 py-1 text-xs font-medium text-stone-700 dark:text-stone-200"
              >
                {topic.name}
              </span>
            ))}
          </div>
        ) : null}

        <PcapLessonContent
          markdown={lesson.contentMarkdown}
          fallback={lesson.objective}
        />

        <form action={markCurriculumLessonComplete}>
          <input type="hidden" name="lesson_id" value={lesson.id} />
          <input
            type="hidden"
            name="return_to"
            value={`${PCAP_COHORT_PATH}/modules/${currentModule.slug}/lessons/${lesson.slug}`}
          />
          <Button type="submit" variant="outline" className="w-full sm:w-auto">
            {lesson.progressStatus === "completed"
              ? "Mark complete again"
              : "Mark lesson complete"}
          </Button>
        </form>

        {lesson.quizzes.length > 0 ? (
          <section className="space-y-5">
            <h2 className={titleSubsectionClass}>Checkpoint</h2>
            {lesson.quizzes.map((quiz) => (
              <Card key={quiz.id} className="space-y-5">
                <div className="space-y-1">
                  <h3 className={titleCardClass}>{quiz.title}</h3>
                  <p className={bodyMutedClass}>{quiz.description}</p>
                  <p className={captionClass}>
                    Spiral mix target: {Math.round(quiz.currentQuestionRatio * 100)}%
                    current · {Math.round(quiz.refresherQuestionRatio * 100)}%
                    refresher
                  </p>
                </div>

                {quiz.questions.map((question, index) => {
                  const choices = normalizedChoices(question.choices);
                  return (
                    <article key={question.id} className="space-y-3 rounded-2xl border border-editorial-border bg-stone-50/70 p-4 dark:bg-stone-900/30">
                      <div className="space-y-2">
                        <p className={captionClass}>Question {index + 1}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-editorial-card px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-editorial-accent">
                            Testing Topic
                          </span>
                          <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                            {question.primaryTopic?.name ?? "PCAP concept"}
                          </span>
                          <span className="rounded-full border border-editorial-border px-2 py-0.5 text-[11px] font-medium text-stone-600 dark:text-stone-300">
                            {question.role === "refresher"
                              ? "Refresher"
                              : "Current concept"}
                          </span>
                        </div>
                        {question.secondaryTopics.length > 0 ? (
                          <p className={captionClass}>
                            Also reinforces:{" "}
                            {question.secondaryTopics.map((t) => t.name).join(", ")}
                          </p>
                        ) : null}
                        <ReactMarkdown>{question.promptMarkdown}</ReactMarkdown>
                      </div>

                      {question.codeSnippet ? (
                        <PcapRunnablePythonBlock
                          code={question.codeSnippet}
                          output={question.expectedOutput}
                        />
                      ) : null}

                      {choices.length > 0 ? (
                        <ul className="space-y-2">
                          {choices.map((choice) => (
                            <li
                              key={choice.id}
                              className="rounded-xl border border-editorial-border bg-editorial-card px-4 py-3 text-sm text-stone-800 dark:text-stone-200"
                            >
                              <span className="font-semibold">{choice.id}.</span>{" "}
                              {choice.label}
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {question.expectedOutput && !question.codeSnippet ? (
                        <div className="rounded-2xl border border-editorial-border bg-editorial-card px-4 py-3">
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
                            Expected output
                          </p>
                          <pre className="mt-2 whitespace-pre-wrap font-mono text-sm text-stone-700 dark:text-stone-300">
                            {question.expectedOutput}
                          </pre>
                        </div>
                      ) : null}

                      {question.discussionPrompt ? (
                        <div className="rounded-2xl border border-editorial-border bg-editorial-card px-4 py-3">
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
                            Discussion prompt
                          </p>
                          <p className={bodyMutedClass}>{question.discussionPrompt}</p>
                        </div>
                      ) : null}

                      {question.discussionThreadId ? (
                        <form
                          action={postCurriculumDiscussionMessage}
                          className="space-y-2 rounded-2xl border border-editorial-border bg-editorial-card px-4 py-3"
                        >
                          <input
                            type="hidden"
                            name="thread_id"
                            value={question.discussionThreadId}
                          />
                          <input
                            type="hidden"
                            name="return_to"
                            value={`${PCAP_COHORT_PATH}/modules/${currentModule.slug}/lessons/${lesson.slug}`}
                          />
                          <label
                            htmlFor={`discussion-${question.id}`}
                            className="text-sm font-medium text-stone-900 dark:text-stone-50"
                          >
                            Add to the discussion
                          </label>
                          <textarea
                            id={`discussion-${question.id}`}
                            name="body"
                            rows={3}
                            required
                            className="min-h-24 w-full rounded-xl border border-editorial-border bg-background px-3 py-2 text-base text-stone-900 outline-none transition focus:border-editorial-accent-muted dark:text-stone-50"
                            placeholder="Explain your reasoning, ask where you're stuck, or help another learner."
                          />
                          <Button type="submit" variant="outline" className="w-full sm:w-auto">
                            Post discussion
                          </Button>
                        </form>
                      ) : null}

                      {question.discussionThreadId ? (
                        <div className="space-y-3 rounded-2xl border border-editorial-border bg-editorial-card px-4 py-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
                              AI Liferaft
                            </p>
                            <p className={bodyMutedClass}>
                              {question.aiResponseMarkdown
                                ? "AI Liferaft Activated"
                                : `AI Liferaft: ${Math.min(
                                    question.aiRequestCount,
                                    2,
                                  )} / 2 requested`}
                            </p>
                          </div>
                          {question.aiResponseMarkdown ? (
                            <div className="prose prose-stone max-w-none dark:prose-invert">
                              <ReactMarkdown>{question.aiResponseMarkdown}</ReactMarkdown>
                            </div>
                          ) : (
                            <form action={requestAiLiferaft}>
                              <input
                                type="hidden"
                                name="thread_id"
                                value={question.discussionThreadId}
                              />
                              <input
                                type="hidden"
                                name="return_to"
                                value={`${PCAP_COHORT_PATH}/modules/${currentModule.slug}/lessons/${lesson.slug}`}
                              />
                              <Button
                                type="submit"
                                variant="outline"
                                className="w-full sm:w-auto"
                              >
                                Request AI Liferaft
                              </Button>
                            </form>
                          )}
                        </div>
                      ) : null}

                      <form action={submitCurriculumQuestionAttempt} className="space-y-2">
                        <input type="hidden" name="quiz_id" value={quiz.id} />
                        <input type="hidden" name="question_id" value={question.id} />
                        <input
                          type="hidden"
                          name="return_to"
                          value={`${PCAP_COHORT_PATH}/modules/${currentModule.slug}/lessons/${lesson.slug}`}
                        />
                        <label
                          htmlFor={`answer-${question.id}`}
                          className="text-sm font-medium text-stone-900 dark:text-stone-50"
                        >
                          Your answer
                        </label>
                        <textarea
                          id={`answer-${question.id}`}
                          name="answer"
                          rows={3}
                          required
                          className="min-h-24 w-full rounded-xl border border-editorial-border bg-editorial-card px-3 py-2 text-base text-stone-900 outline-none transition focus:border-editorial-accent-muted dark:text-stone-50"
                          placeholder="Explain your reasoning or enter the predicted output."
                        />
                        <Button type="submit" variant="outline" className="w-full sm:w-auto">
                          Save attempt
                        </Button>
                      </form>
                    </article>
                  );
                })}
              </Card>
            ))}
          </section>
        ) : null}
      </main>
    </div>
  );
}
