"use client";

import { useEffect, useState } from "react";
import {
  readCompletedSessionIds,
  SESSION_PROGRESS_EVENT,
} from "@/lib/program/session-progress";

export function useCompletedSessions(programId: string): Set<string> {
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => {
      setIds(new Set(readCompletedSessionIds(programId)));
    };
    sync();
    window.addEventListener(SESSION_PROGRESS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SESSION_PROGRESS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [programId]);

  return ids;
}
