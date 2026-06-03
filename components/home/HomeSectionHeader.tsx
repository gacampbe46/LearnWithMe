type HomeSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  id?: string;
};

export function HomeSectionHeader({ eyebrow, title, subtitle, id }: HomeSectionHeaderProps) {
  return (
    <header id={id} className="space-y-2">
      {eyebrow ? (
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-editorial-accent">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-serif-display text-3xl font-semibold leading-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
