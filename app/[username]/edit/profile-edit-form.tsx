"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  bodyMutedClass,
  formLabelClass,
  inputFieldClass,
  optionalHintClass,
} from "@/lib/ui/typography";
import { updateProfileByUsername, type ProfileUpdateState } from "./actions";
import { ProfileLinksEditor } from "./profile-links-editor";

const inputNormal =
  "border-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/40 dark:border-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/25";

type Defaults = {
  firstName: string;
  lastName: string;
  bio: string;
  channelUrl: string;
  links: unknown;
};

export function ProfileEditForm({
  username,
  defaults,
}: {
  username: string;
  defaults: Defaults;
}) {
  const initial: ProfileUpdateState = { formError: null };
  const [state, formAction, pending] = useActionState<
    ProfileUpdateState,
    FormData
  >(updateProfileByUsername, initial);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="username" value={username} />

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

        <div className="space-y-2">
          <label htmlFor="profile-channel-url" className={formLabelClass}>
            YouTube channel URL{" "}
          </label>
          <input
            id="profile-channel-url"
            name="channel_url"
            type="url"
            inputMode="url"
            defaultValue={defaults.channelUrl}
            placeholder="https://www.youtube.com/@yourchannel"
            className={`${inputFieldClass} ${inputNormal}`}
          />
        </div>

        <ProfileLinksEditor linksValue={defaults.links} />
      </Card>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

