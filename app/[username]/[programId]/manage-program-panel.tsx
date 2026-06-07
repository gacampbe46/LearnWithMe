"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { deleteProgramCascade } from "./manage-actions";

type Props = {
  username: string;
  programId: string;
};

export function ManageProgramPanel({ username, programId }: Props) {
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  return (
    <Card>
      <details className="border-red-200/80 dark:border-red-900/50">
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
