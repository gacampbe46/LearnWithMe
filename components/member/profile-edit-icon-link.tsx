import { CogIcon } from "@/components/icons/cog-icon";
import { iconButtonClass } from "@/lib/ui/typography";
import Link from "next/link";

type Props = {
  href: string;
  ariaLabel?: string;
  titleProp?: string;
};

/** Icon-only link to edit profile settings. */
export function ProfileEditIconLink({
  href,
  ariaLabel = "Edit profile",
  titleProp,
}: Props) {
  const title = titleProp ?? ariaLabel;
  return (
    <Link href={href} className={iconButtonClass} aria-label={ariaLabel} title={title}>
      <CogIcon />
    </Link>
  );
}
