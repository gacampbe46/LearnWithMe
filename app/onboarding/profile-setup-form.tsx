"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ProfileAvatar } from "@/components/profile-avatar";
import type { InterestTagOption } from "@/lib/catalog/interest-tags";
import {
  profileSetupInterestChipClasses,
  profileSetupInterestChipPeerClasses,
} from "@/components/program/topic-chip-styles";
import { completeOnboarding } from "./actions";
import {
  onboardingFormInitialState,
  type OnboardingFormState,
} from "./onboarding-state";
import { UsernameAvailabilityField } from "./username-availability-field";
import type { OauthAvatarPreview } from "@/lib/auth/oauth-user";
import {
  bodyMutedClass,
  formLabelClass,
  formLegendClass,
  inputFieldClass,
  inputFocusClass,
  optionalHintClass,
} from "@/lib/ui/typography";

type Props = {
  nextPath: string;
  defaultFirstName: string;
  defaultLastName: string;
  oauthAvatar: OauthAvatarPreview;
  interestTags: InterestTagOption[];
  tagsLoadError: string | null;
};

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
      <div className="flex flex-col items-center gap-2 border-b border-editorial-border pb-6 text-center">
        <ProfileAvatar
          name={oauthAvatar.label}
          imageUrl={oauthAvatar.pictureUrl}
          size="lg"
          className="ring-2 ring-stone-100 dark:ring-stone-800"
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
            className="rounded-xl border border-editorial-border border-l-4 border-l-red-500 bg-editorial-card px-4 py-3 text-sm leading-relaxed text-stone-800 dark:border-l-red-400 dark:text-stone-200"
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
              className={formLabelClass}
            >
              First Name
            </label>
            <input
              id="onboarding-first"
              name="first_name"
              type="text"
              autoComplete="given-name"
              defaultValue={defaultFirstName}
              className={`${inputFieldClass} ${inputFocusClass}`}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="onboarding-last"
              className={formLabelClass}
            >
              Last Name
            </label>
            <input
              id="onboarding-last"
              name="last_name"
              type="text"
              autoComplete="family-name"
              defaultValue={defaultLastName}
              className={`${inputFieldClass} ${inputFocusClass}`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="onboarding-bio"
            className={formLabelClass}
          >
            Bio{" "}
            <span className={optionalHintClass}>(optional)</span>
          </label>
          <textarea
            id="onboarding-bio"
            name="bio"
            rows={4}
            maxLength={2000}
            placeholder="A short introduction for your profile"
            className={`${inputFieldClass} ${inputFocusClass} resize-y`}
          />
        </div>

        <fieldset className="space-y-3 border-0 p-0">
          <legend className={formLegendClass}>Interests</legend>
          <p className={bodyMutedClass}>
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
                      className={`${profileSetupInterestChipClasses} ${profileSetupInterestChipPeerClasses}`}
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
