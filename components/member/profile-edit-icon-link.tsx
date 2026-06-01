import { CogIcon } from "@/components/icons/cog-icon";
import Link from "next/link";

const linkClasses =
  "inline-flex shrink-0 items-center justify-center rounded-md p-1.5 text-zinc-600 transition hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-100";

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
    <Link href={href} className={linkClasses} aria-label={ariaLabel} title={title}>
      <CogIcon />
    </Link>
  );
}
