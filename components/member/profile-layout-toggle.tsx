import { LayoutFullIcon } from "@/components/icons/layout-full-icon";
import { LayoutHubIcon } from "@/components/icons/layout-hub-icon";
import { profilePageHref } from "@/lib/member";
import Link from "next/link";

const btnBase =
  "inline-flex shrink-0 items-center justify-center rounded-md p-1.5 transition";
const inactive =
  "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-100";
const active =
  "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50";

type LayoutMode = "hub" | "full";

type Props = {
  slug: string;
  /** Which layout is currently rendered. */
  active: LayoutMode;
};

/** Swap between compact hub and full profile (`?layout=`). */
export function ProfileLayoutToggle({ slug, active: activeLayout }: Props) {
  const hubHref = profilePageHref(slug, "hub");
  const fullHref = profilePageHref(slug, "full");

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-zinc-200/90 bg-zinc-50/80 p-0.5 dark:border-zinc-700 dark:bg-zinc-900/60">
      <Link
        href={hubHref}
        className={`${btnBase} ${activeLayout === "hub" ? active : inactive}`}
        aria-label="Compact profile view"
        title="Compact profile view"
        aria-current={activeLayout === "hub" ? "page" : undefined}
      >
        <LayoutHubIcon />
      </Link>
      <Link
        href={fullHref}
        className={`${btnBase} ${activeLayout === "full" ? active : inactive}`}
        aria-label="Full profile view"
        title="Full profile view"
        aria-current={activeLayout === "full" ? "page" : undefined}
      >
        <LayoutFullIcon />
      </Link>
    </div>
  );
}
