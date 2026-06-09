type ProgramHiddenBadgeProps = {
  className?: string;
};

export function ProgramHiddenBadge({ className = "" }: ProgramHiddenBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100 ${className}`.trim()}
    >
      Hidden from learners
    </span>
  );
}
