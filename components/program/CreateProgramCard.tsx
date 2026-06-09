import { bodyMutedClass, titleCardClass } from "@/lib/ui/typography";
import Link from "next/link";

type CreateProgramCardProps = {
  hasPrograms?: boolean;
};

export function CreateProgramCard({ hasPrograms = false }: CreateProgramCardProps) {
  return (
    <Link
      href="/teach/programs/new"
      className="flex h-full min-h-[15rem] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-editorial-border bg-editorial-card/40 p-5 text-center transition hover:border-editorial-accent hover:bg-editorial-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-editorial-accent-muted"
    >
      <span
        aria-hidden
        className="flex h-11 w-11 items-center justify-center rounded-full border border-editorial-border bg-editorial-card text-2xl font-light leading-none text-editorial-accent"
      >
        +
      </span>
      <div className="space-y-1">
        <p className={titleCardClass}>
          {hasPrograms ? "Create another program" : "Create program"}
        </p>
        <p className={bodyMutedClass}>
          Publish a new session-by-session offering
        </p>
      </div>
    </Link>
  );
}
