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
import { useEffect, useMemo, useRef, useState } from "react";
import { bodyMutedClass, formLabelClass, inputFieldClass } from "@/lib/ui/typography";

const inputNormal =
  "border-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/40 dark:border-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/25";

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

type HubLinkRow = { label: string; href: string };

function parseHubLinks(value: unknown): HubLinkRow[] {
  const rec = asRecord(value);
  const hubLinks = rec && Array.isArray(rec.hubLinks) ? rec.hubLinks : null;
  if (!hubLinks) return [];
  const out: HubLinkRow[] = [];
  for (const v of hubLinks) {
    const r = asRecord(v);
    if (!r) continue;
    const label = typeof r.label === "string" ? r.label : "";
    const href = typeof r.href === "string" ? r.href : "";
    if (!label.trim() || !href.trim()) continue;
    out.push({ label, href });
  }
  return out;
}

type Item = {
  id: string;
  label: string;
  href: string;
};

function newId(seed: string) {
  // Stable enough for client-only reorder list; avoids pulling in uuid.
  return `${seed}-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

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

function SortableLinkRow({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: Item;
  index: number;
  onChange: (id: string, next: { label?: string; href?: string }) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <li ref={setNodeRef} style={style}>
      <div
        className={`space-y-2 rounded-xl border p-4 transition-shadow ${
          isDragging
            ? "border-zinc-300 shadow-lg shadow-zinc-900/15 ring-1 ring-zinc-300/70 dark:border-zinc-600 dark:ring-zinc-600"
            : "border-zinc-200 dark:border-zinc-800"
        }`}
      >
        <div className="flex items-start gap-2">
          <GripHandle attributes={attributes} listeners={listeners} />
          <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className={formLabelClass} htmlFor={`hub-label-${item.id}`}>
                Label
              </label>
              <input
                id={`hub-label-${item.id}`}
                type="text"
                maxLength={80}
                value={item.label}
                onChange={(e) => onChange(item.id, { label: e.target.value })}
                className={`${inputFieldClass} ${inputNormal}`}
              />
            </div>
            <div className="space-y-2">
              <label className={formLabelClass} htmlFor={`hub-href-${item.id}`}>
                URL
              </label>
              <input
                id={`hub-href-${item.id}`}
                type="text"
                maxLength={500}
                value={item.href}
                onChange={(e) => onChange(item.id, { href: e.target.value })}
                className={`${inputFieldClass} ${inputNormal}`}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900"
            aria-label={`Remove link ${index + 1}`}
            title="Remove link"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

export function ProfileLinksEditor({
  linksValue,
  maxLinks = 12,
}: {
  linksValue: unknown;
  maxLinks?: number;
}) {
  const initial = useMemo(() => parseHubLinks(linksValue), [linksValue]);
  const [items, setItems] = useState<Item[]>(() =>
    initial.map((l, idx) => ({
      id: newId(`link-${idx}`),
      label: l.label,
      href: l.href,
    })),
  );

  useEffect(() => {
    setItems(
      initial.map((l, idx) => ({
        id: newId(`link-${idx}`),
        label: l.label,
        href: l.href,
      })),
    );
  }, [initial]);

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
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
  };

  const addLink = () => {
    setItems((prev) => {
      if (prev.length >= maxLinks) return prev;
      return [
        ...prev,
        {
          id: newId(`link-${prev.length}`),
          label: "",
          href: "",
        },
      ];
    });
  };

  const onChange = (id: string, next: { label?: string; href?: string }) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, ...next } : it,
      ),
    );
  };

  const onRemove = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const ids = items.map((i) => i.id);

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Channel links
        </div>
        <p className={bodyMutedClass}>
          Drag to reorder. Your audience hub, not just a link hub.
        </p>
      </div>

      {/* Hidden inputs in current order for server action */}
      {items.map((item, idx) => (
        <div key={item.id} className="hidden">
          <input name={`hub_label_${idx + 1}`} value={item.label} readOnly />
          <input name={`hub_href_${idx + 1}`} value={item.href} readOnly />
        </div>
      ))}

      {items.length > 1 ? (
        <p className={bodyMutedClass}>Tip: grab the left handle to reorder.</p>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ul className="space-y-3">
            {items.map((item, idx) => (
              <SortableLinkRow
                key={item.id}
                item={item}
                index={idx}
                onChange={onChange}
                onRemove={onRemove}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="pt-1">
        <button
          type="button"
          onClick={addLink}
          disabled={items.length >= maxLinks}
          className="w-full min-h-10 justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          Add link
        </button>
      </div>
    </section>
  );
}

