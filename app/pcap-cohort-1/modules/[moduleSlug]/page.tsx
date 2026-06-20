import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ProfileAvatar } from "@/components/profile-avatar";
import { SectionHeader } from "@/components/SectionHeader";
import type { PcapCurriculumMember } from "@/lib/pcap-cohort-1/schema-data";
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
import { markCurriculumModuleComplete } from "../../actions";

type PageProps = {
  params: Promise<{ moduleSlug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { moduleSlug } = await params;
  const curriculum = await loadPcapCurriculumState();
  const currentModule = curriculum.moduleBySlug.get(moduleSlug);
  return {
    title: currentModule ? `${currentModule.title} — PCAP Cohort` : "PCAP Module",
    description: currentModule?.summary ?? currentModule?.objective,
  };
}

function lessonStatusLabel(status: string | null): string {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";
  return "Not started";
}

function CompletedMembers({ members }: { members: PcapCurriculumMember[] }) {
  if (members.length === 0) {
    return (
      <p className={captionClass}>
        No cohort members have marked this module complete yet.
      </p>
    );
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

export default async function PcapModulePage({ params }: PageProps) {
  const { moduleSlug } = await params;
  const curriculum = await loadPcapCurriculumState();
  const currentModule = curriculum.moduleBySlug.get(moduleSlug);

  if (!curriculum.cohort || !currentModule) {
    notFound();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className={`${pageMainClass} space-y-8`}>
        <nav>
          <Link href={PCAP_COHORT_PATH} className={navLinkClass}>
            ← Back to PCAP Cohort
          </Link>
        </nav>

        <SectionHeader
          eyebrow="PCAP module"
          title={currentModule.title}
          subtitle={currentModule.summary || currentModule.objective}
        />

        <Card className="space-y-4">
          <div className="space-y-1">
            <h2 className={titleCardClass}>Module completion</h2>
            <p className={bodyMutedClass}>
              Mark this when you have worked through the module lessons and feel
              ready to keep moving. The cohort can see who has reached this
              milestone.
            </p>
          </div>
          <CompletedMembers members={currentModule.completedBy} />
          <form action={markCurriculumModuleComplete}>
            <input type="hidden" name="module_id" value={currentModule.id} />
            <input
              type="hidden"
              name="return_to"
              value={`${PCAP_COHORT_PATH}/modules/${currentModule.slug}`}
            />
            <Button type="submit" variant="outline" className="w-full sm:w-auto">
              {currentModule.progressStatus === "completed"
                ? "Marked complete"
                : "Mark module complete"}
            </Button>
          </form>
        </Card>

        <section className="space-y-4">
          <h2 className={titleSubsectionClass}>Lessons</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {currentModule.lessons.map((lesson) => (
              <li key={lesson.id}>
                <Card className="flex h-full flex-col gap-4">
                  <div className="space-y-2">
                    <p className={captionClass}>
                      Lesson {lesson.sortOrder + 1} · {lesson.estimatedMinutes} min ·{" "}
                      {lessonStatusLabel(lesson.progressStatus)}
                    </p>
                    <h3 className={titleCardClass}>{lesson.title}</h3>
                    <p className={bodyMutedClass}>
                      {lesson.summary || lesson.objective}
                    </p>
                    {lesson.topics.length > 0 ? (
                      <p className={captionClass}>
                        Topics: {lesson.topics.map((t) => t.name).join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-auto">
                    <Button
                      href={`${PCAP_COHORT_PATH}/modules/${currentModule.slug}/lessons/${lesson.slug}`}
                      variant="outline"
                      className="w-full justify-center sm:w-auto"
                    >
                      Open lesson
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        {currentModule.quizzes.length > 0 ? (
          <section className="space-y-4">
            <h2 className={titleSubsectionClass}>Module checkpoints</h2>
            <ul className="space-y-3">
              {currentModule.quizzes.map((quiz) => (
                <li key={quiz.id}>
                  <Card className="space-y-2">
                    <h3 className={titleCardClass}>{quiz.title}</h3>
                    <p className={bodyMutedClass}>{quiz.description}</p>
                    <p className={captionClass}>
                      Spiral mix: {Math.round(quiz.currentQuestionRatio * 100)}%
                      current · {Math.round(quiz.refresherQuestionRatio * 100)}%
                      refresher
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
