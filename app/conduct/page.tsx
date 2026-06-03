import { ConductMarkdown } from "@/components/ConductMarkdown";
import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code of conduct",
  description:
    "Community standards for learnwithme: respectful teaching and learning, what we encourage, unacceptable behavior, reporting, and enforcement.",
};

export default async function ConductPage() {
  const mdPath = path.join(process.cwd(), "docs", "CODE_OF_CONDUCT.md");
  const source = await fs.readFile(mdPath, "utf8");

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 pb-16">
        <ConductMarkdown source={source} />
      </main>
    </div>
  );
}
