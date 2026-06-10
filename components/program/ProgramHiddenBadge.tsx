type ProgramHiddenBadgeProps = {
  className?: string;
  /** `overlay` — on thumbnail; `compact` — short label; `default` — full inline badge. */
  variant?: "default" | "compact" | "overlay";
};

const variantClasses = {
  default:
    "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.1em]",
  compact:
    "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]",
  overlay:
    "border-white/30 bg-stone-950/65 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white backdrop-blur-[2px]",
} as const;

const variantLabels = {
  default: "Hidden from users",
  compact: "Hidden",
  overlay: "Hidden",
} as const;

export function ProgramHiddenBadge({
  className = "",
  variant = "default",
}: ProgramHiddenBadgeProps) {
  const label = variantLabels[variant];

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border font-medium ${variantClasses[variant]} ${className}`.trim()}
      title={variant === "overlay" || variant === "compact" ? "Hidden from users" : undefined}
      aria-label={variant === "overlay" || variant === "compact" ? "Hidden from users" : undefined}
    >
      {label}
    </span>
  );
}
