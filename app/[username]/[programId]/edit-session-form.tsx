"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  addSessionInitialState,
  type AddSessionFormState,
} from "./add-session-form-state";
import { formLabelClass, inputFieldClass } from "@/lib/ui/typography";
import { updateProgramSession } from "./actions";

type Props = {
  username: string;
  programId: string;
  sessionId: string;
  initialTitle: string;
  initialDescription: string;
  initialVideoInput: string;
};

const inputNormal =
  "border-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/40 dark:border-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/25";

export function EditSessionForm({
  username,
  programId,
  sessionId,
  initialTitle,
  initialDescription,
  initialVideoInput,
}: Props) {
  const [state, formAction, pending] = useActionState<
    AddSessionFormState,
    FormData
  >(updateProgramSession, addSessionInitialState);

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [videoUrl, setVideoUrl] = useState(initialVideoInput);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setVideoUrl(initialVideoInput);
  }, [sessionId, initialTitle, initialDescription, initialVideoInput]);

  const isDirty = useMemo(
    () =>
      title.trim() !== initialTitle.trim() ||
      description.trim() !== initialDescription.trim() ||
      videoUrl.trim() !== initialVideoInput.trim(),
    [
      title,
      description,
      videoUrl,
      initialTitle,
      initialDescription,
      initialVideoInput,
    ],
  );

  const hasRequired =
    title.trim().length > 0 && videoUrl.trim().length > 0;
  const canSubmit = isDirty && hasRequired && !pending;

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="username" value={username} />
        <input type="hidden" name="program_id" value={programId} />
        <input type="hidden" name="session_id" value={sessionId} />

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
            htmlFor="edit-session-title"
            className={formLabelClass}
          >
            Title
          </label>
          <input
            id="edit-session-title"
            name="title"
            required
            maxLength={280}
            autoComplete="off"
            placeholder="Example: Getting started with the tools"
            className={`${inputFieldClass} ${inputNormal}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-session-description"
            className={formLabelClass}
          >
            Description
          </label>
          <textarea
            id="edit-session-description"
            name="description"
            rows={3}
            maxLength={8000}
            placeholder="What this session covers"
            className={`${inputFieldClass} ${inputNormal} resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-session-video"
            className={formLabelClass}
          >
            Video (YouTube)
          </label>
          <input
            id="edit-session-video"
            name="content_url"
            required
            maxLength={2000}
            autoComplete="off"
            placeholder="https://www.youtube.com/watch?v=… or paste the video ID"
            className={`${inputFieldClass} ${inputNormal}`}
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="min-h-9 rounded-full px-5 text-sm font-medium"
            disabled={!canSubmit}
          >
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
