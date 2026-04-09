import { MarkdownDoc } from "@/components/MarkdownDoc";
import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Design principles",
  description:
    "How learnwithme approaches UX: calm engagement, completion-first learning, light milestone recognition, bounded community, and safety by design.",
};

export default async function DesignPrinciplesPage() {
  const mdPath = path.join(process.cwd(), "DESIGN_PRINCIPLES.md");
  const source = await fs.readFile(mdPath, "utf8");

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 pb-16">
        <nav className="mb-10 flex flex-wrap gap-x-4 gap-y-2">
          <Link
            href="/"
            className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
          >
            ← Home
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
          >
            Why this exists
          </Link>
          <Link
            href="/conduct"
            className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
          >
            Code of conduct
          </Link>
        </nav>

        <article className="space-y-8">
          <header className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
              learnwithme
            </p>
          </header>

          <MarkdownDoc source={source} />
        </article>
      </main>
    </div>
  );
}
