import { ConductMarkdown } from "@/components/ConductMarkdown";
import fs from "node:fs/promises";
import path from "node:path";
import { navLinkClass, sectionEyebrowClass } from "@/lib/ui/typography";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Code of conduct",
  description:
    "Community standards for learnwithme: respectful teaching and learning, what we encourage, unacceptable behavior, reporting, and enforcement.",
};

export default async function ConductPage() {
  const mdPath = path.join(process.cwd(), "CODE_OF_CONDUCT.md");
  const source = await fs.readFile(mdPath, "utf8");

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 pb-16">
        <nav className="mb-10 flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/" className={navLinkClass}>
            ← Home
          </Link>
          <Link href="/about" className={navLinkClass}>
            Why this exists
          </Link>
        </nav>

        <article className="space-y-8">
          <header className="space-y-4">
            <p className={sectionEyebrowClass}>learnwithme</p>
          </header>

          <ConductMarkdown source={source} />
        </article>
      </main>
    </div>
  );
}
