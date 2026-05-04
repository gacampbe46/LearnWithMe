import { bodyLeadClass, titlePrimaryClass } from "@/lib/ui/typography";

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
      <h2 className={titlePrimaryClass}>{title}</h2>
      {subtitle ? <p className={bodyLeadClass}>{subtitle}</p> : null}
    </header>
  );
}
