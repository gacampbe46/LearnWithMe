"use client";

import type { DraggableAttributes } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { deleteProgramSession } from "@/app/[username]/[programId]/actions";
import { reorderProgramSessions } from "@/app/[username]/[programId]/manage-actions";
import { EditPencilIcon } from "@/components/icons/edit-pencil-icon";
import { TrashIcon } from "@/components/icons/trash-icon";
import { bodyLeadClass, bodyMutedClass, captionClass, iconButtonClass, titleSmallClass } from "@/lib/ui/typography";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EditProgramIconLink } from "@/components/program/edit-program-icon-link";

export type ManageSessionRow = {
  id: string;
  title: string;
  description: string;
  videoInput: string;
};

type Props = {
  profileSlug: string;
  programId: string;
  sessionsStamp: string;
  /** Hide links to `/sessions/new` when add form is inline (create wizard). */
  hideAddLinks?: boolean;
  editingSessionId?: string | null;
  onEditSession?: (session: ManageSessionRow) => void;
};

function GripHandle({
  attributes,
  listeners,
}: {
  attributes: DraggableAttributes;
  listeners?: Record<string, unknown>;
}) {
  return (
    <button
      type="button"
      {...attributes}
      {...listeners}
      className="touch-manipulation rounded-md px-2 py-1.5 text-stone-400 transition hover:bg-stone-200/80 hover:text-stone-600 active:cursor-grabbing dark:text-stone-500 dark:hover:bg-stone-800/60 dark:hover:text-stone-300"
      aria-label="Drag to reorder"
      title="Drag to reorder"
    >
      <span className="flex flex-col gap-0.5" aria-hidden>
        {[0, 1].map((row) => (
          <span key={row} className="flex justify-center gap-px">
            {[0, 1, 2].map((d) => (
              <span
                key={`${row}-${d}`}
                className="block size-[3px] rounded-full bg-current opacity-75"
              />
            ))}
          </span>
        ))}
      </span>
    </button>
  );
}

function SortableSessionRow({
  session,
  profileSlug,
  programId,
  onDeleteSession,
  isEditing,
  onEditSession,
}: {
  session: ManageSessionRow;
  profileSlug: string;
  programId: string;
  onDeleteSession: (sessionId: string) => Promise<void>;
  isEditing?: boolean;
  onEditSession?: (session: ManageSessionRow) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: session.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  const viewerHref = `/${profileSlug}/${programId}/${session.id}`;
  const editHref = `/${profileSlug}/${programId}/sessions/${session.id}/edit`;
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const iconBtn =
    "inline-flex shrink-0 items-center justify-center rounded-md p-1.5 text-stone-600 transition enabled:cursor-pointer disabled:opacity-50 dark:text-stone-400";

  return (
    <li ref={setNodeRef} style={style}>
      <Card
        className={`transition-shadow ${
          isDragging
            ? "border-editorial-accent-muted shadow-lg shadow-stone-900/15 ring-1 ring-editorial-accent-muted/70 dark:ring-stone-600"
            : isEditing
              ? "border-editorial-accent-muted ring-1 ring-editorial-accent-muted/70"
              : "hover:border-editorial-accent dark:hover:border-editorial-accent-muted"
        }`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <GripHandle attributes={attributes} listeners={listeners} />
            <Link href={viewerHref} className="min-w-0 flex-1">
              <p className={titleSmallClass}>{session.title}</p>
              {session.description ? (
                <p className={`mt-1 ${bodyMutedClass}`}>
                  {session.description}
                </p>
              ) : null}
            </Link>
            <div className="flex shrink-0 items-center gap-3 sm:gap-4">
              {onEditSession ? (
                <button
                  type="button"
                  className={`${iconButtonClass} ${isEditing ? "text-editorial-accent" : ""}`.trim()}
                  aria-label="Edit session"
                  title="Edit session"
                  aria-pressed={isEditing}
                  onClick={() => onEditSession(session)}
                >
                  <EditPencilIcon />
                </button>
              ) : (
                <EditProgramIconLink
                  href={editHref}
                  ariaLabel="Edit session"
                  titleProp="Edit session"
                />
              )}
              {!confirmDelete ? (
                <button
                  type="button"
                  className={`${iconBtn} hover:bg-stone-100/80 hover:text-red-700 dark:hover:bg-stone-800/40 dark:hover:text-red-400`}
                  aria-label="Remove session"
                  title="Remove session"
                  onClick={() => setConfirmDelete(true)}
                >
                  <TrashIcon />
                </button>
              ) : null}
            </div>
          </div>
          {confirmDelete ? (
            <div
              className="flex flex-col gap-2 rounded-xl border border-red-200/90 bg-red-50/90 px-3 py-2.5 dark:border-red-900/50 dark:bg-red-950/35 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              role="group"
              aria-label="Confirm remove session"
            >
              <p className="text-sm text-red-950 dark:text-red-100">
                Remove this session permanently?
              </p>
              <div className="flex shrink-0 items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-editorial-border bg-editorial-card px-3 py-1.5 text-sm font-medium text-stone-800 transition hover:bg-stone-100 dark:text-stone-100 dark:hover:bg-stone-800"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteBusy}
                  className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-60 dark:bg-red-800 dark:hover:bg-red-700"
                  onClick={() => {
                    void (async () => {
                      setDeleteBusy(true);
                      try {
                        await onDeleteSession(session.id);
                        setConfirmDelete(false);
                      } finally {
                        setDeleteBusy(false);
                      }
                    })();
                  }}
                >
                  {deleteBusy ? "Removing…" : "Remove"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </li>
  );
}

export function ManageSessionsList({
  profileSlug,
  programId,
  sessionsStamp,
  hideAddLinks = false,
  editingSessionId = null,
  onEditSession,
}: Props) {
  const router = useRouter();
  const parseRows = (stamp: string): ManageSessionRow[] => {
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
  };

  const [items, setItems] = useState<ManageSessionRow[]>(() =>
    parseRows(sessionsStamp),
  );

  useEffect(() => {
    setItems(parseRows(sessionsStamp));
  }, [sessionsStamp]);

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const persistInFlightRef = useRef(false);
  const pendingIdsRef = useRef<string[] | null>(null);

  const [isPersisting, setIsPersisting] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);

  const persistOrder = useCallback(
    (orderedIds: string[]) => {
      if (persistInFlightRef.current) {
        pendingIdsRef.current = orderedIds;
        return;
      }
      persistInFlightRef.current = true;
      setIsPersisting(true);
      setPersistError(null);

      void (async () => {
        let failed = false;
        let idsToRun: string[] | null = orderedIds;

        try {
          while (true) {
            if (!idsToRun?.length) {
              const queued = pendingIdsRef.current;
              pendingIdsRef.current = null;
              idsToRun = queued?.length ? queued : null;
              if (!idsToRun) break;
            }

            const r = await reorderProgramSessions({
              programId,
              orderedSessionIds: idsToRun,
            });
            idsToRun = null;

            if (!r.ok) {
              setPersistError(r.error);
              failed = true;
              router.refresh();
              break;
            }
          }

          if (!failed) {
            router.refresh();
          }
        } finally {
          const tail = pendingIdsRef.current;
          pendingIdsRef.current = null;
          persistInFlightRef.current = false;
          setIsPersisting(false);
          if (tail?.length && !failed) {
            queueMicrotask(() => persistOrder(tail));
          }
        }
      })();
    },
    [programId, router],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      const r = await deleteProgramSession({ programId, sessionId });
      if (!r.ok) {
        setPersistError(r.error);
        return;
      }
      setItems((prev) => prev.filter((s) => s.id !== sessionId));
      router.refresh();
    },
    [programId, router],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const prev = itemsRef.current;
    const oldIdx = prev.findIndex((s) => s.id === active.id);
    const newIdx = prev.findIndex((s) => s.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const next = arrayMove(prev, oldIdx, newIdx);
    itemsRef.current = next;
    setItems(next);
    persistOrder(next.map((s) => s.id));
  };

  if (items.length === 0) {
    return (
      <div className="space-y-3">
        <p className={bodyLeadClass}>No sessions yet.</p>
        {hideAddLinks ? null : (
          <Button
            href={`/${profileSlug}/${programId}/sessions/new`}
            variant="outline"
            className="w-full min-h-10 justify-center px-5 text-sm font-medium"
          >
            Add session
          </Button>
        )}
      </div>
    );
  }

  const ids = items.map((s) => s.id);

  return (
    <>
      {items.length > 1 ? (
        <p className={captionClass}>
          Drag each row by the grip on the left to reorder. Learners see sessions
          in this order on your program page.
        </p>
      ) : null}
      {persistError ? (
        <p
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-50"
        >
          {persistError}
        </p>
      ) : null}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ul
            className={`space-y-3 transition-opacity ${isPersisting ? "opacity-70" : ""}`}
            aria-busy={isPersisting}
          >
            {items.map((s) => (
              <SortableSessionRow
                key={s.id}
                session={s}
                profileSlug={profileSlug}
                programId={programId}
                onDeleteSession={deleteSession}
                isEditing={editingSessionId === s.id}
                onEditSession={onEditSession}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {hideAddLinks ? null : (
        <div className="pt-1">
          <Button
            href={`/${profileSlug}/${programId}/sessions/new`}
            variant="outline"
            className="w-full min-h-10 justify-center px-5 text-sm font-medium"
          >
            Add another session
          </Button>
        </div>
      )}
    </>
  );
}
