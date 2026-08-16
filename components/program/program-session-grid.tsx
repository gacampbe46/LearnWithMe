"use client";

import { ProgramSessionCard } from "@/components/program/ProgramSessionCard";
import { SessionProgressNav } from "@/components/program/session-progress-nav";
import type { ProgramSession } from "@/lib/member";
import { useCompletedSessions } from "@/lib/program/use-completed-sessions";
import { sessionGridClass } from "@/lib/ui/page-layout";

type Props = {
  programId: string;
  profileSlug: string;
  sessions: ProgramSession[];
  /** Hide local completion until the viewer actually has access. */
  revealProgress?: boolean;
};

export function ProgramSessionGrid({
  programId,
  profileSlug,
  sessions,
  revealProgress = true,
}: Props) {
  const completed = useCompletedSessions(programId);
  const steps = sessions.map((s) => ({
    id: s.id,
    href: `/${profileSlug}/${programId}/${s.id}`,
    label: s.title,
  }));

  return (
    <div className="space-y-5">
      {revealProgress ? (
        <SessionProgressNav programId={programId} steps={steps} />
      ) : null}
      <ul className={sessionGridClass}>
      {sessions.map((s, index) => (
        <li key={s.id} className="min-w-0">
          <ProgramSessionCard
            session={s}
            href={`/${profileSlug}/${programId}/${s.id}`}
            sessionNumber={index + 1}
            sessionTotal={sessions.length}
            completed={revealProgress && completed.has(s.id)}
          />
        </li>
      ))}
      </ul>
    </div>
  );
}
