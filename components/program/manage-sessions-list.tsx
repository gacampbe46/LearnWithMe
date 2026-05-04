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
import { reorderProgramSessions } from "@/app/[username]/[programId]/manage-actions";
import { bodyLeadClass, bodyMutedClass, captionClass, titleSmallClass } from "@/lib/ui/typography";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EditProgramIconLink } from "@/components/edit-program-icon-link";

export type ManageSessionRow = {
  id: string;
  title: string;
  description: string;
};

type Props = {
  profileSlug: string;
  programId: string;
  sessionsStamp: string;
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
      className="touch-manipulation rounded-md px-2 py-1.5 text-zinc-400 transition hover:bg-zinc-200/80 hover:text-zinc-600 active:cursor-grabbing dark:text-zinc-500 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-300"
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
}: {
  session: ManageSessionRow;
  profileSlug: string;
  programId: string;
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

  return (
    <li ref={setNodeRef} style={style}>
      <Card
        className={`transition-shadow ${
          isDragging
            ? "border-zinc-300 shadow-lg shadow-zinc-900/15 ring-1 ring-zinc-300/70 dark:border-zinc-600 dark:ring-zinc-600"
            : "hover:border-zinc-400/90 dark:hover:border-zinc-600"
        }`}
      >
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
          <EditProgramIconLink
            href={editHref}
            ariaLabel="Edit session"
            titleProp="Edit session"
          />
        </div>
      </Card>
    </li>
  );
}

export function ManageSessionsList({
  profileSlug,
  programId,
  sessionsStamp,
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState<ManageSessionRow[]>(() => {
    try {
      const p = JSON.parse(sessionsStamp) as unknown;
      return Array.isArray(p) ? (p as ManageSessionRow[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const next = JSON.parse(sessionsStamp) as unknown;
      if (Array.isArray(next)) {
        setItems(next as ManageSessionRow[]);
      }
    } catch {
      setItems([]);
    }
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
        <Button
          href={`/${profileSlug}/${programId}/sessions/new`}
          variant="outline"
          className="w-full min-h-10 justify-center px-5 text-sm font-medium"
        >
          Add session
        </Button>
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
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <div className="pt-1">
        <Button
          href={`/${profileSlug}/${programId}/sessions/new`}
          variant="outline"
          className="w-full min-h-10 justify-center px-5 text-sm font-medium"
        >
          Add another session
        </Button>
      </div>
    </>
  );
}
