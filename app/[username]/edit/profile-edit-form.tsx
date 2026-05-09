"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { LayoutFullIcon } from "@/components/icons/layout-full-icon";
import { LayoutHubIcon } from "@/components/icons/layout-hub-icon";
import {
  profileSetupInterestChipClasses,
  profileSetupInterestChipPeerClasses,
} from "@/components/program/topic-chip-styles";
import type { InterestTagOption } from "@/lib/catalog/interest-tags";
import {
  bodyMutedClass,
  formLabelClass,
  formLegendClass,
  inputFieldClass,
  optionalHintClass,
} from "@/lib/ui/typography";
import { updateProfileByUsername, type ProfileUpdateState } from "./actions";

const inputNormal =
  "border-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/40 dark:border-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/25";

/** Stored preference for edit form — only hub vs full (no device_adaptive). */
export type EditProfileLayoutDefault = "link_hub" | "full_content";

const layoutChoiceRow =
  "flex flex-wrap items-stretch gap-2 sm:flex-nowrap";

const layoutChoiceBtn =
  "inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-200/90 bg-zinc-50/80 px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100/90 hover:text-zinc-900 has-[:checked]:border-zinc-400 has-[:checked]:bg-zinc-200 has-[:checked]:text-zinc-950 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50 dark:has-[:checked]:border-zinc-500 dark:has-[:checked]:bg-zinc-800 dark:has-[:checked]:text-zinc-50 dark:focus-within:outline-zinc-500 sm:min-w-[8.5rem]";

type Defaults = {
  firstName: string;
  lastName: string;
  bio: string;
  profileLayout: EditProfileLayoutDefault;
  selectedInterestIds: string[];
};

export function ProfileEditForm({
  username,
  interestTags,
  tagsLoadError,
  defaults,
}: {
  username: string;
  interestTags: InterestTagOption[];
  tagsLoadError: string | null;
  defaults: Defaults;
}) {
  const interestEditingEnabled =
    tagsLoadError === null && interestTags.length > 0;

  const initial: ProfileUpdateState = {
    formError: null,
    interestsError: null,
  };
  const [state, formAction, pending] = useActionState<
    ProfileUpdateState,
    FormData
  >(updateProfileByUsername, initial);

  const formRef = useRef<HTMLFormElement>(null);
  const [hasInterestSelection, setHasInterestSelection] = useState(false);
  const [interestCount, setInterestCount] = useState(
    defaults.selectedInterestIds.length,
  );
  const [interestsOpen, setInterestsOpen] = useState(false);

  const syncInterestSelection = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const n = form.querySelectorAll('input[name="interest"]:checked').length;
    setHasInterestSelection(n > 0);
    setInterestCount(n);
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    syncInterestSelection();
    form.addEventListener("change", syncInterestSelection);
    return () => form.removeEventListener("change", syncInterestSelection);
  }, [interestTags.length, syncInterestSelection]);

  useEffect(() => {
    if (state.interestsError) setInterestsOpen(true);
  }, [state.interestsError]);

  const canSubmit =
    !pending &&
    (!interestEditingEnabled || hasInterestSelection);

  const selected = new Set(defaults.selectedInterestIds);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-6"
      noValidate
    >
      <input type="hidden" name="username" value={username} />
      <input
        type="hidden"
        name="interest_catalog_ok"
        value={interestEditingEnabled ? "1" : "0"}
      />

      {state.formError ? (
        <div
          role="alert"
          className="rounded-xl border border-zinc-200 border-l-4 border-l-red-500 bg-zinc-50/90 px-4 py-3 text-sm leading-relaxed text-zinc-800 dark:border-zinc-700 dark:border-l-red-400 dark:bg-zinc-900/50 dark:text-zinc-200"
        >
          {state.formError}
        </div>
      ) : null}

      <Card className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="profile-first" className={formLabelClass}>
              First Name
            </label>
            <input
              id="profile-first"
              name="first_name"
              type="text"
              autoComplete="given-name"
              defaultValue={defaults.firstName}
              className={`${inputFieldClass} ${inputNormal}`}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="profile-last" className={formLabelClass}>
              Last Name
            </label>
            <input
              id="profile-last"
              name="last_name"
              type="text"
              autoComplete="family-name"
              defaultValue={defaults.lastName}
              className={`${inputFieldClass} ${inputNormal}`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="profile-bio" className={formLabelClass}>
            Bio <span className={optionalHintClass}>(optional)</span>
          </label>
          <textarea
            id="profile-bio"
            name="bio"
            rows={5}
            maxLength={2000}
            defaultValue={defaults.bio}
            placeholder="A slightly longer intro"
            className={`${inputFieldClass} ${inputNormal} resize-y`}
          />
        </div>

        {tagsLoadError ? (
          <div
            role="alert"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
          >
            <p className="font-medium">Could not load interests</p>
            <p className="mt-1 opacity-90">{tagsLoadError}</p>
            <p className="mt-2 text-xs opacity-80">
              You can still update your name, bio, and layout. Interest choices
              were left unchanged.
            </p>
          </div>
        ) : null}

        {interestTags.length > 0 ? (
          <details
            open={interestsOpen}
            onToggle={(e) =>
              setInterestsOpen(e.currentTarget.open)
            }
            className="border-0 p-0"
          >
            <summary
              className={`${formLegendClass} flex cursor-pointer list-none items-center gap-1.5 rounded-lg py-1 -mx-1 px-1 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/40 [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-500`}
            >
              <span
                aria-hidden
                className={`inline-flex w-5 shrink-0 justify-center text-zinc-400 transition-transform duration-200 ease-out dark:text-zinc-500 ${interestsOpen ? "rotate-90" : ""}`}
              >
                &gt;
              </span>
              <span>Interests</span>
              {interestCount > 0 ? (
                <span className={`${optionalHintClass} font-normal`}>
                  ({interestCount} selected)
                </span>
              ) : null}
            </summary>
            <div
              className="space-y-3 pt-3 pl-6"
              role="group"
              aria-label="Interest topics"
            >
              <p className={bodyMutedClass}>
                Choose one or more that fit you.
              </p>
              <div className="flex flex-wrap gap-2">
                {interestTags.map((t) => {
                  const inputId = `edit-interest-${t.id}`;
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
                        defaultChecked={selected.has(t.id)}
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
              {state.interestsError ? (
                <p
                  id="edit-profile-interests-error"
                  role="alert"
                  className="text-sm leading-relaxed text-red-700 dark:text-red-300/90"
                >
                  {state.interestsError}
                </p>
              ) : null}
            </div>
          </details>
        ) : !tagsLoadError ? (
          <div className="space-y-2">
            <p className={formLegendClass}>Interests</p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              No tags are available yet. Add rows to the{" "}
              <span className="font-mono">tags</span> table in Supabase, then
              refresh this page.
            </p>
          </div>
        ) : null}

        <fieldset className="space-y-3 border-0 p-0">
          <legend className={formLegendClass}>Default Profile Layout</legend>
          <div
            className={layoutChoiceRow}
            role="radiogroup"
            aria-label="Default Profile Layout"
          >
            <label className={layoutChoiceBtn}>
              <input
                type="radio"
                name="profile_layout"
                value="link_hub"
                defaultChecked={defaults.profileLayout === "link_hub"}
                className="sr-only"
              />
              <span className="pointer-events-none inline-flex items-center gap-2">
                <LayoutHubIcon />
                <span>Compact</span>
              </span>
            </label>
            <label className={layoutChoiceBtn}>
              <input
                type="radio"
                name="profile_layout"
                value="full_content"
                defaultChecked={defaults.profileLayout === "full_content"}
                className="sr-only"
              />
              <span className="pointer-events-none inline-flex items-center gap-2">
                <LayoutFullIcon />
                <span>Full</span>
              </span>
            </label>
          </div>
        </fieldset>
      </Card>

      <Button type="submit" className="w-full" disabled={!canSubmit}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
