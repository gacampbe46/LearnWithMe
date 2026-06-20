import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { loadPcapCohortState } from "@/lib/pcap-cohort-1/cohort-data";
import { PCAP_COHORT_PATH, pcapCohort } from "@/lib/pcap-cohort-1/quiz-data";
import { pageMainClass } from "@/lib/ui/page-layout";
import {
  bodyLeadClass,
  bodyMutedClass,
  captionClass,
  navLinkClass,
  titleDisplayClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";
import { JoinCohortButton } from "./join-cohort-button";
import { PcapCohortDashboard } from "./pcap-cohort-dashboard";
import { PcapCurriculumDashboard } from "./pcap-curriculum-dashboard";
import { PcapQuizForm } from "./pcap-quiz-form";
import { PcapQuizResults } from "./pcap-quiz-results";
import { loadPcapCurriculumState } from "@/lib/pcap-cohort-1/schema-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PCAP Cohort 1 — learnwithme",
  description:
    "A small LearnWithMe cohort preparing for the PCAP Certified Associate Python Programmer exam together.",
};

type PageProps = {
  searchParams: Promise<{ view?: string; error?: string }>;
};

function ErrorNotice({ error }: { error?: string }) {
  if (!error) return null;
  const copy: Record<string, string> = {
    join: "Could not join the cohort. Try again.",
    "join-first": "Join the cohort before taking the quiz.",
  };
  const message = copy[error];
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
    >
      {message}
    </div>
  );
}

function Landing({
  signedIn,
  isMember,
  error,
}: {
  signedIn: boolean;
  isMember: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-5">
          <Link href={`${PCAP_COHORT_PATH}/about`} className={navLinkClass}>
            About this cohort
          </Link>
          <div className="space-y-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-editorial-accent">
              LearnWithMe experiment
            </p>
            <h1 className={titleDisplayClass}>PCAP Cohort 1</h1>
            <p className={bodyLeadClass}>{pcapCohort.description}</p>
            <p className={bodyMutedClass}>
              This cohort includes quizzes, shared progress, answer visibility,
              and discussion around concepts so learners can see where peers are
              stuck and help each other understand.
            </p>
          </div>
          <ErrorNotice error={error} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <JoinCohortButton
              signedIn={signedIn}
              isMember={isMember}
              className="w-full sm:w-auto"
            />
            <Link
              href={`${PCAP_COHORT_PATH}/about`}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-editorial-border px-6 text-base font-medium text-stone-800 transition hover:border-editorial-accent-muted dark:text-stone-100"
            >
              Read the Experiment
            </Link>
          </div>
        </div>

        <Card className="space-y-5">
          <h2 className={titleSubsectionClass}>What we&apos;re testing</h2>
          <div className="space-y-4">
            {[
              "Real people join a small cohort.",
              "Real people complete the same practice quiz.",
              "Real people see each other's answers.",
              "Real people ask for help and explain concepts.",
            ].map((item, idx) => (
              <div key={item} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white dark:bg-stone-100 dark:text-stone-900">
                  {idx + 1}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                  {item}
                </p>
              </div>
            ))}
          </div>
          <p className={captionClass}>
            The goal is not proving quizzes work. The goal is proving whether
            learning feels better when the cohort can see, ask, and help.
          </p>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
            Shared answers
          </p>
          <p className={captionClass}>
            See member avatars next to the answer each person chose.
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
            Help signals
          </p>
          <p className={captionClass}>
            Mark a question when you want help with the concept.
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
            Discussion
          </p>
          <p className={captionClass}>
            Ask why an answer works or explain it to someone else.
          </p>
        </Card>
      </section>
    </div>
  );
}

export default async function PcapCohortPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const state = await loadPcapCohortState();
  const curriculum = state.isMember
    ? await loadPcapCurriculumState()
    : null;
  const view = params.view;

  let body: React.ReactNode;
  if (!state.isMember) {
    body = (
      <Landing
        signedIn={Boolean(state.currentUser)}
        isMember={state.isMember}
        error={params.error}
      />
    );
  } else if (view === "quiz") {
    body = <PcapQuizForm error={params.error} />;
  } else if (view === "results") {
    body = <PcapQuizResults state={state} error={params.error} />;
  } else {
    body = (
      <>
        <SectionHeader
          eyebrow="PCAP Cohort 1"
          title="Build PCAP readiness together."
          subtitle="Move through short lessons, revisit earlier topics, compare reasoning, and use the cohort discussion when concepts get sticky."
          className="mb-6"
        />
        {curriculum ? (
          <div className="mb-8">
            <PcapCurriculumDashboard curriculum={curriculum} />
          </div>
        ) : null}
        <PcapCohortDashboard state={state} />
      </>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className={pageMainClass}>{body}</main>
    </div>
  );
}
