"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { Program } from "@/data/member";
import type { InterestTagOption } from "@/lib/data/interest-tags";
import {
  profileSetupInterestChipClasses,
  profileSetupInterestChipPeerClasses,
} from "@/components/program/topic-chip-styles";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PROGRAM_CATALOG_TOPIC_FIELD } from "@/lib/program/program-catalog-topic-form";
import {
  bodyMutedClass,
  captionClass,
  formLabelClass,
  formLegendClass,
  inputFieldClass,
  titleCardClass,
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

const basicsFormId = (programId: string) => `program-edit-basics-${programId}`;

const inputNormal =
  "border-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/40 dark:border-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/25";

function tagDefaultPrice(p: Program): string {
  if (p.priceValue != null && Number.isFinite(p.priceValue)) {
    return String(p.priceValue);
  }
  return "";
}

function draftPriceMatchesProgram(priceDraft: string, p: Program): boolean {
  const cleaned = priceDraft.trim().replace(/^\$/, "");
  if (p.priceValue == null || !Number.isFinite(p.priceValue)) {
    return cleaned === "";
  }
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) && n === p.priceValue;
}

function orderedTopicFingerprint(tags: Program["topicTags"]): string {
  return [...new Set(tags.map((t) => t.id.trim()).filter(Boolean))]
    .sort()
    .join(",");
}

function setsEqual(server: Set<string>, draft: Set<string>): boolean {
  if (server.size !== draft.size) return false;
  for (const id of draft) {
    if (!server.has(id)) return false;
  }
  return true;
}

export function EditProgramPanel({
  username,
  programId,
  program,
  catalogTagOptions,
  catalogTagsLoadError,
}: Props) {
  const formId = basicsFormId(programId);

  const [basicState, basicAction, basicPending] = useActionState<
    EditProgramBasicsState,
    FormData
  >(updateProgramBasics, editProgramBasicsInitial);

  const serverTopicFingerprint = useMemo(
    () => orderedTopicFingerprint(program.topicTags),
    [program.topicTags],
  );

  const [draftTopicIds, setDraftTopicIds] = useState<Set<string>>(
    () =>
      new Set(
        program.topicTags.map((t) => t.id.trim()).filter(Boolean),
      ),
  );

  const [draftTitle, setDraftTitle] = useState(program.title);
  const [draftDescription, setDraftDescription] = useState(program.subtitle);
  const [draftPrice, setDraftPrice] = useState(() => tagDefaultPrice(program));

  useEffect(() => {
    setDraftTitle(program.title);
    setDraftDescription(program.subtitle);
    setDraftPrice(tagDefaultPrice(program));
  }, [program.id, program.title, program.subtitle, program.priceValue]);

  useEffect(() => {
    const ids = serverTopicFingerprint
      ? serverTopicFingerprint.split(",").filter(Boolean)
      : [];
    setDraftTopicIds(new Set(ids));
  }, [program.id, serverTopicFingerprint]);

  const basicsDirty = useMemo(
    () =>
      draftTitle !== program.title ||
      draftDescription !== program.subtitle ||
      !draftPriceMatchesProgram(draftPrice, program),
    [
      draftTitle,
      draftDescription,
      draftPrice,
      program.title,
      program.subtitle,
      program.priceValue,
    ],
  );

  const tagsDirty = useMemo(() => {
    const fromServer = new Set(
      serverTopicFingerprint
        ? serverTopicFingerprint.split(",").filter(Boolean)
        : [],
    );
    return !setsEqual(fromServer, draftTopicIds);
  }, [serverTopicFingerprint, draftTopicIds]);

  const saveDirty = basicsDirty || tagsDirty;

  function toggleDraftTopic(tagId: string) {
    setDraftTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  }

  return (
    <Card className="space-y-8">
      <header className="space-y-1 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h3 className={titleCardClass}>Edit program</h3>
        <p className={bodyMutedClass}>
          Same choices as creating a program — topics use the checkbox chips below;
          save when ready.
        </p>
      </header>

      <form
        id={formId}
        action={basicAction}
        className="space-y-4"
        aria-busy={basicPending}
      >
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
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
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
            value={draftDescription}
            onChange={(e) => setDraftDescription(e.target.value)}
            className={`${inputFieldClass} ${inputNormal} resize-y`}
          />
        </div>

        <fieldset
          className="space-y-3 border-0 p-0"
          key={`${program.id}-${serverTopicFingerprint}`}
        >
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
                      checked={draftTopicIds.has(t.id)}
                      onChange={() => {
                        toggleDraftTopic(t.id);
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
            value={draftPrice}
            onChange={(e) => setDraftPrice(e.target.value)}
            className={`${inputFieldClass} ${inputNormal}`}
          />
          <p className={captionClass}>
            Whole numbers or decimals; use{" "}
            <span className="font-medium">0</span> for free programs.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <Button
            type="submit"
            className="w-full min-h-10 px-5 text-sm font-medium sm:w-auto"
            disabled={basicPending || !saveDirty}
          >
            {basicPending ? "Saving…" : "Save program"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
