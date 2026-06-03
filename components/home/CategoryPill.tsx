import Link from "next/link";

type CategoryPillProps = {
  label: string;
  href?: string;
  className?: string;
};

const pillClass =
  "inline-flex shrink-0 items-center rounded-full border border-editorial-border bg-editorial-card px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-stone-700 transition hover:border-editorial-accent hover:text-stone-900 dark:text-stone-300 dark:hover:border-editorial-accent dark:hover:text-stone-100";

export function CategoryPill({ label, href = "#featured-creators", className = "" }: CategoryPillProps) {
  return (
    <Link href={href} className={`${pillClass} ${className}`.trim()}>
      {label}
    </Link>
  );
}
