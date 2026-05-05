"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { InterestTagOption } from "@/lib/catalog/interest-tags";
import type { Program } from "@/lib/member";
import {
  profileSetupInterestChipClasses,
  profileSetupInterestChipPeerClasses,
} from "@/components/program/topic-chip-styles";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PROGRAM_CATALOG_TOPIC_FIELD } from "@/lib/program/program-catalog-topic-form";
import { priceAllowsSubmit } from "@/lib/program/program-price-form";
import {
  captionClass,
  formLabelClass,
  formLegendClass,
  inputFieldClass,
} from "@/lib/ui/typography";
import { updateProgramBasics } from "./program-edit-actions";
import {
  editProgramBasicsInitial,
  type EditProgramBasicsState,
} from "./program-edit-actions-state";

type Props = {
  username: string;
  programId: string;
  program: Program;
  catalogTagOptions: InterestTagOption[];
  catalogTagsLoadError: string | null;
};

const inputNormal =
  "border-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/40 dark:border-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/25";

function tagDefaultPrice(p: Program): string {
  if (p.priceValue != null && Number.isFinite(p.priceValue)) {
    return String(p.priceValue);
  }
  return "0";
}

/** Stable key for topic fieldset — matches fingerprint used server-side for tags. */
function orderedTopicFingerprint(tags: Program["topicTags"]): string {
  return [...new Set(tags.map((t) => t.id.trim()).filter(Boolean))]
    .sort()
    .join(",");
}

function fingerprintFromSelectedIds(ids: ReadonlySet<string>): string {
  return [...ids].map((id) => id.trim()).filter(Boolean).sort().join(",");
}

export function EditProgramPanel({
  username,
  programId,
  program,
  catalogTagOptions,
  catalogTagsLoadError,
}: Props) {
  const [basicState, basicAction, basicPending] = useActionState<
    EditProgramBasicsState,
    FormData
  >(updateProgramBasics, editProgramBasicsInitial);

  /** Full navigation matches create flow `redirect()` — SPA routing alone can leave stale UI. */
  useEffect(() => {
    const path = basicState.redirectTo;
    if (!path || basicState.savedAt == null) return;
    window.location.assign(path);
  }, [basicState.redirectTo, basicState.savedAt]);

  const serverTopicFingerprint = useMemo(
    () => orderedTopicFingerprint(program.topicTags),
    [program.topicTags],
  );

  const [title, setTitle] = useState(program.title);
  const [description, setDescription] = useState(program.subtitle);
  const [price, setPrice] = useState(() => tagDefaultPrice(program));
  const [selectedTopicIds, setSelectedTopicIds] = useState(
    () => new Set(program.topicTags.map((t) => t.id)),
  );

  useEffect(() => {
    setTitle(program.title);
    setDescription(program.subtitle);
    setPrice(tagDefaultPrice(program));
    setSelectedTopicIds(new Set(program.topicTags.map((t) => t.id)));
  }, [program.id, program.title, program.subtitle, program.priceValue, serverTopicFingerprint]);

  const isDirty =
    title !== program.title ||
    description !== program.subtitle ||
    price.trim() !== tagDefaultPrice(program).trim() ||
    fingerprintFromSelectedIds(selectedTopicIds) !== serverTopicFingerprint;

  const canSubmit =
    isDirty &&
    title.trim().length > 0 &&
    priceAllowsSubmit(price) &&
    !basicPending;

  return (
    <Card className="space-y-5">
      <form action={basicAction} className="space-y-5">
        <input type="hidden" name="username" value={username} />
        <input type="hidden" name="program_id" value={programId} />

        {basicState.formError ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-100"
          >
            {basicState.formError}
          </p>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="edit-title" className={formLabelClass}>
            Title
          </label>
          <input
            id="edit-title"
            name="title"
            required
            maxLength={240}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`${inputFieldClass} ${inputNormal}`}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-description" className={formLabelClass}>
            Description
          </label>
          <textarea
            id="edit-description"
            name="description"
            rows={4}
            maxLength={8000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputFieldClass} ${inputNormal} resize-y`}
          />
        </div>

        <fieldset className="space-y-3 border-0 p-0">
          <legend className={formLegendClass}>Topic tags</legend>

          {catalogTagsLoadError ? (
            <div
              role="alert"
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
            >
              {catalogTagsLoadError}
            </div>
          ) : catalogTagOptions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {catalogTagOptions.map((t) => {
                const inputId = `program-edit-topic-${programId}-${t.id}`;
                return (
                  <label
                    key={t.id}
                    className="inline-flex cursor-pointer select-none"
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      name={PROGRAM_CATALOG_TOPIC_FIELD}
                      value={t.id}
                      checked={selectedTopicIds.has(t.id)}
                      onChange={(e) => {
                        setSelectedTopicIds((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(t.id);
                          else next.delete(t.id);
                          return next;
                        });
                      }}
                      className="peer sr-only"
                    />
                    <span
                      className={`${profileSetupInterestChipClasses} ${profileSetupInterestChipPeerClasses}`}
                    >
                      {t.label}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : null}
        </fieldset>

        <div className="space-y-2">
          <label htmlFor="edit-price" className={formLabelClass}>
            Price (USD)
          </label>
          <input
            id="edit-price"
            name="price"
            required
            maxLength={32}
            inputMode="decimal"
            placeholder="0 for free, or e.g. 29.99"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={`${inputFieldClass} ${inputNormal}`}
          />
          <p className={captionClass}>
            Whole numbers or decimals; use{" "}
            <span className="font-medium">0</span> for free programs.
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            className="min-h-10 justify-center px-4 py-2 text-sm font-medium sm:px-5"
            disabled={!canSubmit}
          >
            {basicPending ? "Saving…" : "Save program"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
