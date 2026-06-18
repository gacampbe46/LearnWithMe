import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PCAP_COHORT_PATH, pcapQuiz } from "@/lib/pcap-cohort-1/quiz-data";
import {
  bodyMutedClass,
  captionClass,
  navLinkClass,
  titleCardClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";
import Link from "next/link";
import { submitPcapQuiz } from "./actions";

type Props = {
  error?: string;
};

export function PcapQuizForm({ error }: Props) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <nav>
        <Link href={PCAP_COHORT_PATH} className={navLinkClass}>
          ← Back to Cohort
        </Link>
      </nav>

      <div className="space-y-2">
        <p className={bodyMutedClass}>Quiz 1 of 1</p>
        <h2 className={titleSubsectionClass}>{pcapQuiz.title}</h2>
        <p className={bodyMutedClass}>
          Answer each question first. After submitting, you&apos;ll see how the
          cohort answered and where people want help.
        </p>
      </div>

      {error === "incomplete" ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
        >
          Answer every question before submitting.
        </div>
      ) : null}
      {error === "submit" ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
        >
          Could not save your quiz. Try again.
        </div>
      ) : null}

      <form action={submitPcapQuiz} className="space-y-4">
        {pcapQuiz.questions.map((question, index) => (
          <article key={question.id} id={question.id} className="scroll-mt-24">
            <Card className="space-y-4">
              <div className="space-y-2">
                <p className={captionClass}>Question {index + 1}</p>
                <h3 className={titleCardClass}>{question.concept}</h3>
                <p className="whitespace-pre-line text-base leading-relaxed text-stone-800 dark:text-stone-200">
                  {question.prompt}
                </p>
              </div>

              <fieldset className="space-y-3">
                <legend className="sr-only">
                  Choose an answer for question {index + 1}
                </legend>
                {question.choices.map((choice) => (
                  <label
                    key={choice.id}
                    className="block cursor-pointer rounded-2xl border border-editorial-border bg-stone-50/70 p-4 transition hover:border-editorial-accent-muted dark:bg-stone-900/30"
                  >
                    <input
                      type="radio"
                      name={`answer_${question.id}`}
                      value={choice.id}
                      required
                      className="mt-1 h-5 w-5 shrink-0 accent-stone-900 dark:accent-stone-100"
                    />
                    <span className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-editorial-border text-sm font-semibold text-stone-700 dark:text-stone-200">
                        {choice.id}
                      </span>
                      <span className="pt-1 text-sm leading-relaxed text-stone-800 dark:text-stone-200">
                        {choice.label}
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>
            </Card>
          </article>
        ))}

        <div className="sticky bottom-3 z-20 rounded-2xl border border-editorial-border bg-editorial-card/95 p-3 shadow-lg shadow-stone-900/10 backdrop-blur dark:shadow-black/30 sm:static sm:bg-transparent sm:p-0 sm:shadow-none">
          <Button type="submit" className="w-full sm:w-auto">
            Submit Quiz
          </Button>
        </div>
      </form>
    </div>
  );
}
