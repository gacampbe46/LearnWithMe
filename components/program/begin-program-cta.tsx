"use client";

import { Button } from "@/components/Button";
import { StickyBottomCTA } from "@/components/StickyBottomCTA";
import { firstIncompleteSessionId } from "@/lib/program/session-progress";
import { useCompletedSessions } from "@/lib/program/use-completed-sessions";

type Props = {
  profileSlug: string;
  programId: string;
  sessionIds: string[];
};

export function BeginProgramCta({
  profileSlug,
  programId,
  sessionIds,
}: Props) {
  const completed = useCompletedSessions(programId);
  const nextId =
    firstIncompleteSessionId(sessionIds, [...completed]) ?? sessionIds[0];
  if (!nextId) return null;

  const allDone =
    sessionIds.length > 0 && sessionIds.every((id) => completed.has(id));
  const href = `/${profileSlug}/${programId}/${nextId}`;

  return (
    <StickyBottomCTA>
      <Button href={href} className="min-h-12 w-full max-w-sm">
        {allDone
          ? "Review program"
          : completed.size > 0
            ? "Continue program"
            : "Begin program"}
      </Button>
    </StickyBottomCTA>
  );
}
