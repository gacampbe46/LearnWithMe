import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { loadPcapCohortState } from "@/lib/pcap-cohort-1/cohort-data";
import { PCAP_COHORT_PATH } from "@/lib/pcap-cohort-1/quiz-data";
import { pageMainClass } from "@/lib/ui/page-layout";
import {
  bodyMutedClass,
  navLinkClass,
  titleCardClass,
} from "@/lib/ui/typography";
import { JoinCohortButton } from "../join-cohort-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About PCAP Cohort 1 — learnwithme",
  description:
    "Why LearnWithMe is testing a small social cohort for PCAP exam preparation.",
};

export default async function PcapCohortAboutPage() {
  const state = await loadPcapCohortState();

  return (
    <div className="flex min-h-dvh flex-col">
      <main className={`${pageMainClass} space-y-6`}>
        <nav>
          <Link href={PCAP_COHORT_PATH} className={navLinkClass}>
            ← Back to PCAP Cohort 1
          </Link>
        </nav>

        <SectionHeader
          eyebrow="About this cohort"
          title="About PCAP Cohort 1"
          subtitle="A small LearnWithMe cohort preparing for the PCAP Certified Associate Python Programmer exam together."
        />

        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-4">
            <Card className="space-y-2">
              <h2 className={titleCardClass}>The experiment</h2>
              <p className={bodyMutedClass}>
                We are not trying to prove that quizzes work. We are testing
                whether real learners get more value when they can see how peers
                answered, ask for help, and explain concepts to each other.
              </p>
            </Card>

            <Card className="space-y-2">
              <h2 className={titleCardClass}>What members do</h2>
              <p className={bodyMutedClass}>
                Join the cohort, take one PCAP-style quiz, compare answers, mark
                concepts where you need help, and leave short questions or
                explanations under each result.
              </p>
            </Card>

            <Card className="space-y-2">
              <h2 className={titleCardClass}>What success looks like</h2>
              <p className={bodyMutedClass}>
                Real people join, complete the same quiz, see each other&apos;s
                answers, and help each other understand why an answer is correct.
                The network effect is the product hypothesis.
              </p>
            </Card>
          </div>

          <Card className="h-fit space-y-4">
            <h2 className={titleCardClass}>Ready to test it?</h2>
            <p className={bodyMutedClass}>
              The first cohort is intentionally small so we can learn quickly
              from real behavior on mobile and desktop.
            </p>
            <JoinCohortButton
              signedIn={Boolean(state.currentUser)}
              isMember={state.isMember}
              className="w-full sm:w-auto"
            />
          </Card>
        </div>
      </main>
    </div>
  );
}
