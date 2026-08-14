"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { StickyBottomCTA } from "./StickyBottomCTA";
import {
  markSessionCompleted,
  unmarkSessionCompleted,
} from "@/lib/program/session-progress";
import { useCompletedSessions } from "@/lib/program/use-completed-sessions";
import { burstConfetti } from "@/lib/ui/confetti";

type SessionStickyNavProps = {
  programId: string;
  sessionId: string;
  mediaAnchorIds: string[];
  /** Program page — used when there is no following session. */
  finishHref: string;
  /** Following session in program order; when set, final CTA continues the path. */
  nextSessionHref?: string | null;
};

export function SessionStickyNav({
  programId,
  sessionId,
  mediaAnchorIds,
  finishHref,
  nextSessionHref,
}: SessionStickyNavProps) {
  const router = useRouter();
  const completed = useCompletedSessions(programId);
  const alreadyDone = completed.has(sessionId);
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const isLast = index >= mediaAnchorIds.length - 1;

  const goNext = useCallback(() => {
    if (isLast) return;
    const nextId = mediaAnchorIds[index + 1];
    const el = document.getElementById(nextId);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIndex((i) => i + 1);
  }, [mediaAnchorIds, index, isLast]);

  const completeAndGo = useCallback(() => {
    if (leaving) return;
    const href = nextSessionHref ?? finishHref;
    if (alreadyDone) {
      router.push(href);
      return;
    }
    const newly = markSessionCompleted(programId, sessionId);
    if (newly) {
      burstConfetti();
      setLeaving(true);
      window.setTimeout(() => {
        router.push(href);
      }, 650);
      return;
    }
    router.push(href);
  }, [
    alreadyDone,
    finishHref,
    leaving,
    nextSessionHref,
    programId,
    router,
    sessionId,
  ]);

  const markIncomplete = useCallback(() => {
    unmarkSessionCompleted(programId, sessionId);
  }, [programId, sessionId]);

  const primaryLabel = leaving
    ? "Nice work…"
    : alreadyDone
      ? nextSessionHref
        ? "Next session"
        : "Back to program"
      : nextSessionHref
        ? "Complete & next session"
        : "Complete program";

  return (
    <StickyBottomCTA>
      {isLast ? (
        <div className="flex w-full max-w-sm flex-col items-center gap-2">
          <Button
            type="button"
            className="min-h-12 w-full"
            disabled={leaving}
            onClick={completeAndGo}
          >
            {primaryLabel}
          </Button>
          {alreadyDone && !leaving ? (
            <button
              type="button"
              className="text-sm font-medium text-stone-500 underline decoration-editorial-accent-muted underline-offset-4 transition hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
              onClick={markIncomplete}
            >
              Mark incomplete
            </button>
          ) : null}
        </div>
      ) : (
        <Button
          type="button"
          variant="primary"
          className="min-h-12 w-full max-w-sm"
          onClick={goNext}
        >
          Continue
        </Button>
      )}
    </StickyBottomCTA>
  );
}
