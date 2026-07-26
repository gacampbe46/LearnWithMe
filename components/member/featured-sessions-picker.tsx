"use client";

import { useCallback } from "react";
import {
  bodyMutedClass,
  formLabelClass,
  optionalHintClass,
} from "@/lib/ui/typography";

export type FeaturedSessionOption = {
  sessionId: string;
  title: string;
  programTitle: string;
};

const MAX_FEATURED = 3;

type Props = {
  options: FeaturedSessionOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

export function FeaturedSessionsPicker({
  options,
  selectedIds,
  onChange,
  disabled = false,
}: Props) {
  const selectedSet = new Set(selectedIds);

  const toggle = useCallback(
    (sessionId: string) => {
      if (disabled) return;
      if (selectedSet.has(sessionId)) {
        onChange(selectedIds.filter((id) => id !== sessionId));
        return;
      }
      if (selectedIds.length >= MAX_FEATURED) return;
      onChange([...selectedIds, sessionId]);
    },
    [disabled, onChange, selectedIds, selectedSet],
  );

  if (options.length === 0) {
    return (
      <div className="space-y-2">
        <p className={formLabelClass}>
          Featured sessions{" "}
          <span className={optionalHintClass}>(optional)</span>
        </p>
        <p className={bodyMutedClass}>
          Add sessions to a program first, then pick up to {MAX_FEATURED} to
          highlight on your profile.
        </p>
      </div>
    );
  }

  return (
    <fieldset className="space-y-3 border-0 p-0">
      <legend className={formLabelClass}>
        Featured sessions{" "}
        <span className={optionalHintClass}>
          (optional · up to {MAX_FEATURED})
        </span>
      </legend>
      <p className={bodyMutedClass}>
        Shown under “Featured sessions” so visitors can try one session
        quickly. Leave empty to auto-pick from your newest programs.
      </p>
      <ul className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-editorial-border bg-editorial-card p-3">
        {options.map((opt) => {
          const checked = selectedSet.has(opt.sessionId);
          const atCap = selectedIds.length >= MAX_FEATURED && !checked;
          return (
            <li key={opt.sessionId}>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 transition hover:bg-stone-100/80 dark:hover:bg-stone-800/50 ${
                  atCap ? "opacity-50" : ""
                }`}
              >
                <input
                  type="checkbox"
                  name="featured_session"
                  value={opt.sessionId}
                  checked={checked}
                  disabled={disabled || atCap}
                  onChange={() => toggle(opt.sessionId)}
                  className="mt-1"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-stone-900 dark:text-stone-50">
                    {opt.title}
                  </span>
                  <span className="block text-xs text-stone-500 dark:text-stone-400">
                    {opt.programTitle}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
