"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ProfileAvatar } from "@/components/profile-avatar";
import type { InterestTagOption } from "@/lib/data/interest-tags";
import { completeOnboarding } from "./actions";
import {
  onboardingFormInitialState,
  type OnboardingFormState,
} from "./onboarding-state";
import { UsernameAvailabilityField } from "./username-availability-field";
import type { OauthAvatarPreview } from "@/lib/auth/oauth-user";

type Props = {
  nextPath: string;
  defaultFirstName: string;
  defaultLastName: string;
  oauthAvatar: OauthAvatarPreview;
  interestTags: InterestTagOption[];
  tagsLoadError: string | null;
};

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500";

const inputNormal =
  "border-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/40 dark:border-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/25";

export function ProfileSetupForm({
  nextPath,
  defaultFirstName,
  defaultLastName,
  oauthAvatar,
  interestTags,
  tagsLoadError,
}: Props) {
  const [state, formAction, pending] = useActionState<
    OnboardingFormState,
    FormData
  >(completeOnboarding, onboardingFormInitialState);

  const formRef = useRef<HTMLFormElement>(null);
  const [usernameReady, setUsernameReady] = useState(false);
  const [hasInterestSelection, setHasInterestSelection] = useState(false);

  const syncInterestSelection = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const n = form.querySelectorAll('input[name="interest"]:checked').length;
    setHasInterestSelection(n > 0);
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    syncInterestSelection();
    form.addEventListener("change", syncInterestSelection);
    return () => form.removeEventListener("change", syncInterestSelection);
  }, [interestTags.length, syncInterestSelection]);

  const handleUsernameReady = useCallback((ready: boolean) => {
    setUsernameReady(ready);
  }, []);

  const canSubmit =
    !pending &&
    tagsLoadError === null &&
    interestTags.length > 0 &&
    usernameReady &&
    hasInterestSelection;

  return (
    <Card className="space-y-6">
      <div className="flex flex-col items-center gap-2 border-b border-zinc-200 pb-6 text-center dark:border-zinc-800">
        <ProfileAvatar
          name={oauthAvatar.label}
          imageUrl={oauthAvatar.pictureUrl}
          size="lg"
          className="ring-2 ring-zinc-100 dark:ring-zinc-800"
        />
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="space-y-6"
        noValidate
      >
        <input type="hidden" name="next" value={nextPath} />

        {state.formError ? (
          <div
            role="alert"
            className="rounded-xl border border-zinc-200 border-l-4 border-l-red-500 bg-zinc-50/90 px-4 py-3 text-sm leading-relaxed text-zinc-800 dark:border-zinc-700 dark:border-l-red-400 dark:bg-zinc-900/50 dark:text-zinc-200"
          >
            {state.formError}
          </div>
        ) : null}

        {tagsLoadError ? (
          <div
            role="alert"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
          >
            <p className="font-medium">Could not load interests</p>
            <p className="mt-1 opacity-90">{tagsLoadError}</p>
            <p className="mt-2 text-xs opacity-80">
              If this mentions row-level security, run the SQL in{" "}
              <span className="font-mono">
                supabase/migrations/20260303130000_tags_select_catalog_rls.sql
              </span>{" "}
              in the Supabase SQL editor.
            </p>
          </div>
        ) : null}

        <UsernameAvailabilityField
          serverError={state.usernameError}
          onSubmitReadyChange={handleUsernameReady}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="onboarding-first"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              First Name
            </label>
            <input
              id="onboarding-first"
              name="first_name"
              type="text"
              autoComplete="given-name"
              defaultValue={defaultFirstName}
              className={`${inputBase} ${inputNormal}`}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="onboarding-last"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Last Name
            </label>
            <input
              id="onboarding-last"
              name="last_name"
              type="text"
              autoComplete="family-name"
              defaultValue={defaultLastName}
              className={`${inputBase} ${inputNormal}`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="onboarding-bio"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Bio{" "}
            <span className="font-normal text-zinc-500 dark:text-zinc-400">
              (optional)
            </span>
          </label>
          <textarea
            id="onboarding-bio"
            name="bio"
            rows={4}
            maxLength={2000}
            placeholder="A short introduction for your profile"
            className={`${inputBase} ${inputNormal} resize-y`}
          />
        </div>

        <fieldset className="space-y-3 border-0 p-0">
          <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Interests
          </legend>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Choose one or more that fit you.
          </p>
          {interestTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {interestTags.map((t) => {
                const inputId = `interest-${t.id}`;
                return (
                  <label
                    key={t.id}
                    className="inline-flex cursor-pointer select-none"
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      name="interest"
                      value={t.id}
                      className="peer sr-only"
                    />
                    <span
                      className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 peer-checked:border-zinc-900 peer-checked:bg-zinc-900 peer-checked:text-zinc-50 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-zinc-400 dark:border-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/60 dark:peer-checked:border-zinc-100 dark:peer-checked:bg-zinc-100 dark:peer-checked:text-zinc-950 dark:peer-focus-visible:outline-zinc-500"
                    >
                      {t.label}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-amber-800 dark:text-amber-200">
              No tags are available yet. Add rows to the{" "}
              <span className="font-mono">tags</span> table in Supabase, then
              refresh this page.
            </p>
          )}
          {state.interestsError ? (
            <p
              id="onboarding-interests-error"
              role="alert"
              className="text-sm leading-relaxed text-red-700 dark:text-red-300/90"
            >
              {state.interestsError}
            </p>
          ) : null}
        </fieldset>

        <Button type="submit" className="w-full" disabled={!canSubmit}>
          {pending ? "Saving…" : "Finish setup"}
        </Button>
      </form>
    </Card>
  );
}
