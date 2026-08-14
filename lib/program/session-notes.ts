const storageKey = (programId: string, sessionId: string) =>
  `learnwithme.session-notes.${programId}.${sessionId}`;

function isBrowser() {
  return typeof window !== "undefined";
}

export function readSessionNotes(programId: string, sessionId: string): string {
  if (!isBrowser() || !programId || !sessionId) return "";
  try {
    const raw = window.localStorage.getItem(storageKey(programId, sessionId));
    return typeof raw === "string" ? raw : "";
  } catch {
    return "";
  }
}

export function writeSessionNotes(
  programId: string,
  sessionId: string,
  text: string,
): boolean {
  if (!isBrowser() || !programId || !sessionId) return false;
  try {
    const key = storageKey(programId, sessionId);
    if (text.length === 0) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, text);
    }
    return true;
  } catch {
    return false;
  }
}
