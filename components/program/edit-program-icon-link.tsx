import { EditPencilIcon } from "@/components/icons/edit-pencil-icon";
import { iconButtonClass } from "@/lib/ui/typography";
import Link from "next/link";

type Props = {
  href: string;
  /** Defaults to “Edit program” for program cards. */
  ariaLabel?: string;
  /** Shown as native tooltip; falls back to `ariaLabel`. */
  titleProp?: string;
  /** Merged after default link styles. */
  className?: string;
};

/** Icon-only link to edit a program (`aria-label` + `title` for clarity). */
export function EditProgramIconLink({
  href,
  ariaLabel = "Edit program",
  titleProp,
  className = "",
}: Props) {
  const title = titleProp ?? ariaLabel;
  return (
    <Link
      href={href}
      className={`${iconButtonClass} ${className}`.trim()}
      aria-label={ariaLabel}
      title={title}
    >
      <EditPencilIcon />
    </Link>
  );
}
