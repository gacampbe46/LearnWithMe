"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState,
  startTransition,
  type FormEvent,
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
  inputFocusClass,
  optionalHintClass,
} from "@/lib/ui/typography";
import { parseAndValidateUsername } from "@/lib/onboarding/username";
import { updateProfileByUsername, type ProfileUpdateState } from "./actions";
import { UsernameAvailabilityField } from "@/app/onboarding/username-availability-field";
import { ProfileAvatarUpload } from "@/components/profile-avatar-upload";
import { uploadAvatarFile } from "@/lib/profile/upload-avatar-client";

/** Stored preference for edit form — only hub vs full (no device_adaptive). */
export type EditProfileLayoutDefault = "link_hub" | "full_content";

const layoutChoiceRow =
  "flex flex-wrap items-stretch gap-2 sm:flex-nowrap";

const layoutChoiceBtn =
  "inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-editorial-border bg-editorial-card px-3 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-100/90 hover:text-stone-900 has-[:checked]:border-editorial-accent-muted has-[:checked]:bg-stone-200 has-[:checked]:text-stone-950 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-editorial-accent-muted dark:text-stone-300 dark:hover:bg-stone-800/50 dark:hover:text-stone-50 dark:has-[:checked]:border-editorial-accent dark:has-[:checked]:bg-stone-800 dark:has-[:checked]:text-stone-50 dark:focus-within:outline-stone-500 sm:min-w-[8.5rem]";

type Defaults = {
  firstName: string;
  lastName: string;
  bio: string;
  avatarUrl: string | null;
  profileLayout: EditProfileLayoutDefault;
  selectedInterestIds: string[];
};

function interestFingerprint(ids: Iterable<string>): string {
  return [...ids].sort().join("\0");
}

export function ProfileEditForm({
  username,
  userId,
  interestTags,
  tagsLoadError,
  defaults,
}: {
  username: string;
  userId: string;
  interestTags: InterestTagOption[];
  tagsLoadError: string | null;
  defaults: Defaults;
}) {
  const interestEditingEnabled =
    tagsLoadError === null && interestTags.length > 0;

  const catalogIds = useMemo(
    () => new Set(interestTags.map((t) => t.id)),
    [interestTags],
  );

  const initialInterestFingerprint = useMemo(
    () =>
      interestFingerprint(
        defaults.selectedInterestIds.filter((id) => catalogIds.has(id)),
      ),
    [catalogIds, defaults.selectedInterestIds],
  );

  const initial: ProfileUpdateState = {
    formError: null,
    usernameError: null,
    interestsError: null,
    avatarError: null,
  };
  const [state, formAction, pending] = useActionState<
    ProfileUpdateState,
    FormData
  >(updateProfileByUsername, initial);

  const normalizedInitialUsername = useMemo(() => {
    const check = parseAndValidateUsername(username);
    return check.ok ? check.normalized : username.trim().toLowerCase();
  }, [username]);

  const [usernameValue, setUsernameValue] = useState(username);
  const [firstName, setFirstName] = useState(defaults.firstName);
  const [lastName, setLastName] = useState(defaults.lastName);
  const [bio, setBio] = useState(defaults.bio);
  const [avatarUrl, setAvatarUrl] = useState(defaults.avatarUrl);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [profileLayout, setProfileLayout] = useState(defaults.profileLayout);
  const [selectedInterestIds, setSelectedInterestIds] = useState(
    () =>
      new Set(
        defaults.selectedInterestIds.filter((id) => catalogIds.has(id)),
      ),
  );
  const [usernameReady, setUsernameReady] = useState(true);
  const [interestsOpen, setInterestsOpen] = useState(false);

  // Reset fields only when navigating to a different profile (not on every parent render).
  useEffect(() => {
    setUsernameValue(username);
    setFirstName(defaults.firstName);
    setLastName(defaults.lastName);
    setBio(defaults.bio);
    setAvatarUrl(defaults.avatarUrl);
    setPendingAvatarFile(null);
    setAvatarError(null);
    setProfileLayout(defaults.profileLayout);
    setSelectedInterestIds(
      new Set(
        defaults.selectedInterestIds.filter((id) => catalogIds.has(id)),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by profile slug
  }, [username]);

  useEffect(() => {
    if (state.interestsError) setInterestsOpen(true);
  }, [state.interestsError]);

  useEffect(() => {
    if (state.avatarError) setAvatarError(state.avatarError);
  }, [state.avatarError]);

  const handleUsernameReady = useCallback((ready: boolean) => {
    setUsernameReady(ready);
  }, []);

  const hasInterestSelection = selectedInterestIds.size > 0;
  const interestCount = selectedInterestIds.size;

  const isDirty = useMemo(() => {
    const usernameCheck = parseAndValidateUsername(usernameValue);
    const normalizedUsername = usernameCheck.ok
      ? usernameCheck.normalized
      : usernameValue.trim().toLowerCase();
    if (normalizedUsername !== normalizedInitialUsername) return true;
    if (firstName.trim() !== defaults.firstName.trim()) return true;
    if (lastName.trim() !== defaults.lastName.trim()) return true;
    if (bio.trim() !== defaults.bio.trim()) return true;
    if (profileLayout !== defaults.profileLayout) return true;
    if (pendingAvatarFile) return true;
    if (
      interestEditingEnabled &&
      interestFingerprint(selectedInterestIds) !== initialInterestFingerprint
    ) {
      return true;
    }
    return false;
  }, [
    usernameValue,
    normalizedInitialUsername,
    firstName,
    lastName,
    bio,
    profileLayout,
    pendingAvatarFile,
    defaults,
    interestEditingEnabled,
    selectedInterestIds,
    initialInterestFingerprint,
  ]);

  const canSubmit =
    isDirty &&
    !pending &&
    !uploadingAvatar &&
    usernameReady &&
    (!interestEditingEnabled || hasInterestSelection);

  const handleAvatarFile = useCallback((file: File | null) => {
    setPendingAvatarFile(file);
    setAvatarError(null);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit) return;

      const form = event.currentTarget;
      const formData = new FormData(form);

      if (pendingAvatarFile) {
        setUploadingAvatar(true);
        setAvatarError(null);
        const upload = await uploadAvatarFile(userId, pendingAvatarFile);
        setUploadingAvatar(false);
        if (!upload.ok) {
          setAvatarError(upload.error);
          return;
        }
        formData.set("avatar_url", upload.publicUrl);
      }

      startTransition(() => {
        formAction(formData);
      });
    },
    [canSubmit, pendingAvatarFile, userId, formAction],
  );

  const toggleInterest = useCallback((tagId: string) => {
    setSelectedInterestIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <input type="hidden" name="current_username" value={username} />
      <input
        type="hidden"
        name="interest_catalog_ok"
        value={interestEditingEnabled ? "1" : "0"}
      />

      {state.formError ? (
        <div
          role="alert"
          className="rounded-xl border border-editorial-border border-l-4 border-l-red-500 bg-editorial-card px-4 py-3 text-sm leading-relaxed text-stone-800 dark:border-l-red-400 dark:text-stone-200"
        >
          {state.formError}
        </div>
      ) : null}

      <Card className="space-y-6">
        <ProfileAvatarUpload
          name={`${firstName} ${lastName}`.trim() || username}
          imageUrl={avatarUrl}
          disabled={pending || uploadingAvatar}
          error={avatarError}
          onFileChange={handleAvatarFile}
        />

        <UsernameAvailabilityField
          defaultValue={username}
          serverError={state.usernameError}
          onSubmitReadyChange={handleUsernameReady}
          onValueChange={setUsernameValue}
        />

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
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`${inputFieldClass} ${inputFocusClass}`}
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
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`${inputFieldClass} ${inputFocusClass}`}
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
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A slightly longer intro"
            className={`${inputFieldClass} ${inputFocusClass} resize-y`}
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
              className={`${formLegendClass} flex cursor-pointer list-none items-center gap-1.5 rounded-lg py-1 -mx-1 px-1 hover:bg-stone-100/80 dark:hover:bg-stone-800/40 [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-editorial-accent-muted dark:focus-visible:outline-stone-500`}
            >
              <span
                aria-hidden
                className={`inline-flex w-5 shrink-0 justify-center text-stone-400 transition-transform duration-200 ease-out dark:text-stone-500 ${interestsOpen ? "rotate-90" : ""}`}
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
                        checked={selectedInterestIds.has(t.id)}
                        onChange={() => toggleInterest(t.id)}
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
                checked={profileLayout === "link_hub"}
                onChange={() => setProfileLayout("link_hub")}
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
                checked={profileLayout === "full_content"}
                onChange={() => setProfileLayout("full_content")}
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

      <Button
        type="submit"
        className={`w-full ${!canSubmit ? "cursor-not-allowed" : ""}`}
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
      >
        {pending || uploadingAvatar ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
