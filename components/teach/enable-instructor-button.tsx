"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { enableInstructorForCurrentUser } from "@/lib/teach/instructor-access-actions";

type Props = {
  className?: string;
};

export function EnableInstructorButton({
  className = "w-full sm:w-auto",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function enableInstructor() {
    setError(null);
    startTransition(async () => {
      const r = await enableInstructorForCurrentUser();
      if (r.ok) {
        router.refresh();
      } else {
        setError(r.error ?? "Could not update instructor access.");
      }
    });
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-100"
        >
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        className={className}
        disabled={pending}
        onClick={() => enableInstructor()}
      >
        {pending ? "Updating…" : "Enable instructor access"}
      </Button>
    </div>
  );
}
