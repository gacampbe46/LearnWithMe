import { Card } from "@/components/Card";
import { bodyMutedClass, titleCardClass } from "@/lib/ui/typography";
import ReactMarkdown from "react-markdown";
import { PcapRunnablePythonBlock } from "./pcap-runnable-python-block";

type LessonSection = {
  title: string;
  body: string;
};

const sectionStyles: Record<string, string> = {
  "Learning objective":
    "border-sky-200 bg-sky-50/80 dark:border-sky-900/60 dark:bg-sky-950/20",
  "Short explanation":
    "border-editorial-border bg-editorial-card",
  "Common mistake":
    "border-amber-200 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/20",
  "Discussion prompt":
    "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/20",
};

function parseLessonSections(markdown: string): LessonSection[] {
  const sections: LessonSection[] = [];
  const matches = [...markdown.matchAll(/^##\s+(.+)$/gm)];

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const next = matches[i + 1];
    const title = match[1].trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = next?.index ?? markdown.length;
    sections.push({
      title,
      body: markdown.slice(start, end).trim(),
    });
  }

  if (sections.length === 0 && markdown.trim()) {
    return [{ title: "Lesson", body: markdown.trim() }];
  }

  return sections;
}

function codeFromFence(markdown: string): string | null {
  const match = markdown.match(/```(?:python|text)?\n([\s\S]*?)```/);
  return match?.[1]?.trimEnd() ?? null;
}

function markdownWithoutCodeFence(markdown: string): string {
  return markdown.replace(/```(?:python|text)?\n[\s\S]*?```/g, "").trim();
}

function SectionCard({ section }: { section: LessonSection }) {
  const className =
    sectionStyles[section.title] ??
    "border-editorial-border bg-stone-50/70 dark:bg-stone-900/30";

  return (
    <Card className={`space-y-3 border ${className}`}>
      <h2 className={titleCardClass}>{section.title}</h2>
      <div className="prose prose-stone max-w-none dark:prose-invert prose-p:leading-relaxed prose-code:rounded-md prose-code:bg-stone-900/5 prose-code:px-1 prose-code:py-0.5 prose-code:text-stone-900 dark:prose-code:bg-white/10 dark:prose-code:text-stone-100">
        <ReactMarkdown>{section.body}</ReactMarkdown>
      </div>
    </Card>
  );
}

export function PcapLessonContent({
  markdown,
  fallback,
}: {
  markdown: string;
  fallback: string;
}) {
  const sections = parseLessonSections(markdown || fallback);
  const codeSection = sections.find((section) => section.title === "Code example");
  const outputSection = sections.find(
    (section) => section.title === "Expected output",
  );
  const code = codeSection ? codeFromFence(codeSection.body) : null;
  const output = outputSection ? codeFromFence(outputSection.body) : null;
  const codeIntro = codeSection ? markdownWithoutCodeFence(codeSection.body) : "";

  return (
    <div className="space-y-5">
      {sections.map((section) => {
        if (section.title === "Expected output") return null;
        if (section.title === "Code example" && code) {
          return (
            <Card key={section.title} className="space-y-4">
              <div className="space-y-2">
                <h2 className={titleCardClass}>{section.title}</h2>
                {codeIntro ? (
                  <div className="prose prose-stone max-w-none dark:prose-invert">
                    <ReactMarkdown>{codeIntro}</ReactMarkdown>
                  </div>
                ) : (
                  <p className={bodyMutedClass}>
                    Run the example to reveal the stored expected output.
                  </p>
                )}
              </div>
              <PcapRunnablePythonBlock code={code} output={output} />
            </Card>
          );
        }

        return <SectionCard key={section.title} section={section} />;
      })}
    </div>
  );
}
