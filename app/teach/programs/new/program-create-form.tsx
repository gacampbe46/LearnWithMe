"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  profileSetupInterestChipClasses,
  profileSetupInterestChipPeerClasses,
} from "@/components/program/topic-chip-styles";
import type { InterestTagOption } from "@/lib/data/interest-tags";
import { PROGRAM_CATALOG_TOPIC_FIELD } from "@/lib/program/program-catalog-topic-form";
import {
  bodyLeadClass,
  captionClass,
  formLabelClass,
  formLegendClass,
  inputFieldClass,
  subtitleSmClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";
import { priceAllowsSubmit } from "@/lib/program/program-price-form";
import type { TeachingProfile } from "@/lib/teach/teaching-profile";
import {
  createProgram,
  enableInstructorForCurrentUser,
} from "./actions";
import {
  programCreateFormInitialState,
  type ProgramCreateFormState,
} from "./program-create-state";

type Props = {
  profile: TeachingProfile;
  catalogTags: InterestTagOption[];
  catalogTagsLoadError: string | null;
};

const inputNormal =
  "border-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/40 dark:border-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/25";

export function ProgramCreateForm({
  profile,
  catalogTags,
  catalogTagsLoadError,
}: Props) {
  const router = useRouter();
  const [instrPending, startInstrTransition] = useTransition();
  const [instrError, setInstrError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState<
    ProgramCreateFormState,
    FormData
  >(createProgram, programCreateFormInitialState);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const canSubmit =
    title.trim().length > 0 &&
    priceAllowsSubmit(price) &&
    !pending;

  function enableInstructor() {
    setInstrError(null);
    startInstrTransition(async () => {
      const r = await enableInstructorForCurrentUser();
      if (r.ok) {
        router.refresh();
      } else {
        setInstrError(r.error ?? "Could not update instructor access.");
      }
    });
  }

  if (!profile.isInstructor) {
    return (
      <Card className="space-y-5">
        <p className={bodyLeadClass}>
          To create programs, your account needs instructor access.
        </p>
        {instrError ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-100"
          >
            {instrError}
          </p>
        ) : null}
        <Button
          type="button"
          className="w-full sm:w-auto"
          disabled={instrPending}
          onClick={() => enableInstructor()}
        >
          {instrPending ? "Updating…" : "Enable instructor access"}
        </Button>
        <p className={captionClass}>
          Nothing is public yet; you&apos;ll fill in titles, pricing, and
          sessions on the next screens.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-6">
      <header className="space-y-1 border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <h2 className={titleSubsectionClass}>New program</h2>
        <p className={subtitleSmClass}>
          Published as @{profile.username}. You can add sessions after the
          program exists.
        </p>
      </header>

      <form action={formAction} className="space-y-5">
        {state.formError ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-100"
          >
            {state.formError}
          </p>
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="program-title"
            className={formLabelClass}
          >
            Title
          </label>
          <input
            id="program-title"
            name="title"
            required
            maxLength={240}
            autoComplete="off"
            placeholder="Example: Foundations for beginners"
            className={`${inputFieldClass} ${inputNormal}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="program-description"
            className={formLabelClass}
          >
            Description
          </label>
          <textarea
            id="program-description"
            name="description"
            rows={4}
            maxLength={8000}
            placeholder="What people get, how it is structured, who it is for…"
            className={`${inputFieldClass} ${inputNormal} resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <fieldset className="space-y-3 border-0 p-0">
          <legend className={formLegendClass}>
            Topic tags
          </legend>
          {catalogTagsLoadError ? (
            <div
              role="alert"
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
            >
              {catalogTagsLoadError}
            </div>
          ) : catalogTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {catalogTags.map((t) => {
                const inputId = `program-topic-${t.id}`;
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
          <label
            htmlFor="program-price"
            className={formLabelClass}
          >
            Price (USD)
          </label>
          <input
            id="program-price"
            name="price"
            inputMode="decimal"
            required
            maxLength={32}
            placeholder="0 for free, or e.g. 29.99"
            className={`${inputFieldClass} ${inputNormal}`}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
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
            {pending ? "Creating…" : "Create program"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
