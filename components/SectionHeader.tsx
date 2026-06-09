import { bodyLeadClass, sectionEyebrowClass, titlePrimaryClass } from "@/lib/ui/typography";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
};

export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  className = "",
}: SectionHeaderProps) {
  return (
    <header className={`space-y-2 ${className}`.trim()}>
      {eyebrow ? <p className={sectionEyebrowClass}>{eyebrow}</p> : null}
      <h2 className={titlePrimaryClass}>{title}</h2>
      {subtitle ? <p className={bodyLeadClass}>{subtitle}</p> : null}
    </header>
  );
}
