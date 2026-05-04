"use client";

import { useState } from "react";
import { unstable_rethrow } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { deleteProgramCascade, flipLearnerVisibility } from "./manage-actions";
import { captionClass, labelStrongSmClass } from "@/lib/ui/typography";
import { flipVisibilityInitial } from "./manage-visibility-state";

type Props = {
  username: string;
  programId: string;
  isActive: boolean;
};

export function ManageProgramPanel({
  username,
  programId,
  isActive,
}: Props) {
  const [flipPending, setFlipPending] = useState(false);
  const [flipError, setFlipError] = useState<string | null>(null);

  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  async function runFlipVisibility() {
    setFlipError(null);
    setFlipPending(true);
    try {
      const fd = new FormData();
      fd.set("username", username);
      fd.set("program_id", programId);
      const result = await flipLearnerVisibility(flipVisibilityInitial, fd);
      if (typeof result.formError === "string" && result.formError) {
        setFlipError(result.formError);
      }
    } catch (err) {
      unstable_rethrow(err);
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setFlipError(message);
    } finally {
      setFlipPending(false);
    }
  }

  return (
    <Card className="border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={labelStrongSmClass}>Learner visibility</p>
          <p className={`mt-0.5 ${captionClass}`}>
            {isActive
              ? "Learners can see this program on your profile."
              : "Learners won\u2019t see it until you turn this on."}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            disabled={flipPending}
            onClick={() => {
              void runFlipVisibility();
            }}
            className={`relative h-5 w-[2rem] shrink-0 rounded-full transition-colors outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-zinc-400 enabled:cursor-pointer disabled:opacity-60 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-500 ${
              isActive
                ? "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-950 dark:hover:bg-black"
                : "bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-500"
            }`}
            role="switch"
            aria-checked={isActive}
            aria-label={
              isActive ? "Hide program from learners" : "Show program to learners"
            }
          >
            <span
              className={`pointer-events-none absolute left-[3px] top-[3px] block size-[0.8125rem] rounded-full bg-white shadow-sm ring-1 ring-black/10 transition-transform dark:bg-zinc-50 dark:ring-white/20 ${
                isActive ? "translate-x-[0.6875rem]" : "translate-x-0"
              }`}
              aria-hidden
            />
          </button>
          {flipError ? (
            <p
              role="alert"
              className="max-w-[14rem] text-right text-xs leading-snug text-red-600 dark:text-red-400"
            >
              {flipError}
            </p>
          ) : null}
        </div>
      </div>

      <details className="mt-6 border-t border-red-200/80 pt-4 dark:border-red-900/50">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-red-700 outline-none marker:content-none dark:text-red-400 [&::-webkit-details-marker]:hidden">
          <span>Delete program permanently</span>
          <span className="text-xs font-normal text-red-600/80 dark:text-red-400/80" aria-hidden>
            ▼
          </span>
        </summary>
        <form action={deleteProgramCascade} className="mt-3 space-y-3">
          <input type="hidden" name="username" value={username} />
          <input type="hidden" name="program_id" value={programId} />
          <p className="text-xs leading-relaxed text-red-900/90 dark:text-red-200/90">
            Removes program and sessions — cannot be undone.
          </p>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-red-950 dark:text-red-100">
            <input
              type="checkbox"
              name="confirm_delete"
              value="yes"
              checked={deleteConfirmed}
              required
              onChange={(e) => setDeleteConfirmed(e.target.checked)}
              className="rounded border-red-400 text-red-700 dark:border-red-600 dark:text-red-400"
            />
            I understand permanent deletion.
          </label>
          <Button
            type="submit"
            variant="outline"
            disabled={!deleteConfirmed}
            title={
              deleteConfirmed ? undefined : "Check the confirmation above first"
            }
            className="min-h-10 border-red-400 text-sm font-semibold text-red-900 hover:bg-red-50 dark:border-red-700 dark:text-red-100 dark:hover:bg-red-950/40"
          >
            Delete forever
          </Button>
        </form>
      </details>
    </Card>
  );
}
