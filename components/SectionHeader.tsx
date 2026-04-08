type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function SectionHeader({
  title,
  subtitle,
  className = "",
}: SectionHeaderProps) {
  return (
    <header className={`space-y-1 ${className}`.trim()}>
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-base leading-relaxed text-zinc-400">{subtitle}</p>
      ) : null}
    </header>
  );
}
