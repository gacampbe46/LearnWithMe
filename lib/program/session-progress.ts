const storageKey = (programId: string) =>
  `learnwithme.session-progress.${programId}`;

export const SESSION_PROGRESS_EVENT = "learnwithme:session-progress";

function isBrowser() {
  return typeof window !== "undefined";
}

export function readCompletedSessionIds(programId: string): string[] {
  if (!isBrowser() || !programId) return [];
  try {
    const raw = window.localStorage.getItem(storageKey(programId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

/** Returns true when this session was newly marked complete. */
export function markSessionCompleted(
  programId: string,
  sessionId: string,
): boolean {
  if (!isBrowser() || !programId || !sessionId) return false;
  const current = readCompletedSessionIds(programId);
  if (current.includes(sessionId)) return false;
  const next = [...current, sessionId];
  try {
    window.localStorage.setItem(storageKey(programId), JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent(SESSION_PROGRESS_EVENT, { detail: { programId } }),
    );
  } catch {
    return false;
  }
  return true;
}

export function unmarkSessionCompleted(
  programId: string,
  sessionId: string,
): boolean {
  if (!isBrowser() || !programId || !sessionId) return false;
  const current = readCompletedSessionIds(programId);
  if (!current.includes(sessionId)) return false;
  const next = current.filter((id) => id !== sessionId);
  try {
    window.localStorage.setItem(storageKey(programId), JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent(SESSION_PROGRESS_EVENT, { detail: { programId } }),
    );
  } catch {
    return false;
  }
  return true;
}

export function firstIncompleteSessionId(
  sessionIds: string[],
  completedIds: readonly string[],
): string | null {
  const done = new Set(completedIds);
  return sessionIds.find((id) => !done.has(id)) ?? sessionIds[0] ?? null;
}
