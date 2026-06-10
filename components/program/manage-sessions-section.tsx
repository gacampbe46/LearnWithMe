"use client";

import { useEffect, useMemo, useState } from "react";
import { AddSessionForm } from "@/app/[username]/[programId]/add-session-form";
import { EditSessionForm } from "@/app/[username]/[programId]/edit-session-form";
import { Button } from "@/components/Button";
import {
  ManageSessionsList,
  type ManageSessionRow,
} from "@/components/program/manage-sessions-list";
import { titleSubsectionClass } from "@/lib/ui/typography";

type Props = {
  profileSlug: string;
  programId: string;
  sessionsStamp: string;
  sessionCount: number;
};

function parseSessionsStamp(stamp: string): ManageSessionRow[] {
  try {
    const parsed = JSON.parse(stamp) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (row): row is ManageSessionRow =>
          row != null &&
          typeof row === "object" &&
          typeof (row as ManageSessionRow).id === "string" &&
          typeof (row as ManageSessionRow).title === "string",
      )
      .map((row) => ({
        id: row.id,
        title: row.title,
        description:
          typeof row.description === "string" ? row.description : "",
        videoInput:
          typeof row.videoInput === "string" ? row.videoInput : "",
      }));
  } catch {
    return [];
  }
}

function readEditSessionIdFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const match = window.location.hash.match(/^#edit-(.+)$/);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function ManageSessionsSection({
  profileSlug,
  programId,
  sessionsStamp,
  sessionCount,
}: Props) {
  const sessions = useMemo(
    () => parseSessionsStamp(sessionsStamp),
    [sessionsStamp],
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSession, setEditingSession] = useState<ManageSessionRow | null>(
    null,
  );

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#sessions") {
      setShowAddForm(true);
      setEditingSession(null);
      return;
    }

    const editId = readEditSessionIdFromHash();
    if (!editId) return;

    const session = sessions.find((s) => s.id === editId);
    if (session) {
      setEditingSession(session);
      setShowAddForm(false);
    }
  }, [sessions, sessionsStamp]);

  const addLabel =
    sessionCount === 0 ? "Add session" : "Add another session";

  const openAddForm = () => {
    setEditingSession(null);
    setShowAddForm(true);
  };

  const openEditForm = (session: ManageSessionRow) => {
    setShowAddForm(false);
    setEditingSession(session);
  };

  const closeForms = () => {
    setShowAddForm(false);
    setEditingSession(null);
  };

  return (
    <section id="sessions" className="space-y-4 lg:sticky lg:top-20">
      <h3 className={titleSubsectionClass}>Sessions</h3>

      <ManageSessionsList
        profileSlug={profileSlug}
        programId={programId}
        sessionsStamp={sessionsStamp}
        hideAddLinks
        editingSessionId={editingSession?.id ?? null}
        onEditSession={openEditForm}
      />

      {editingSession ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
            Edit session
          </p>
          <EditSessionForm
            username={profileSlug}
            programId={programId}
            sessionId={editingSession.id}
            initialTitle={editingSession.title}
            initialDescription={editingSession.description}
            initialVideoInput={editingSession.videoInput}
          />
          <Button
            type="button"
            variant="ghost"
            className="min-h-10 w-full justify-center px-4 text-sm font-medium sm:w-auto"
            onClick={closeForms}
          >
            Cancel
          </Button>
        </div>
      ) : showAddForm ? (
        <div className="space-y-3">
          <AddSessionForm
            username={profileSlug}
            programId={programId}
            submitLabel={addLabel}
          />
          <Button
            type="button"
            variant="ghost"
            className="min-h-10 w-full justify-center px-4 text-sm font-medium sm:w-auto"
            onClick={closeForms}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full min-h-10 justify-center px-5 text-sm font-medium"
          onClick={openAddForm}
        >
          {addLabel}
        </Button>
      )}
    </section>
  );
}
