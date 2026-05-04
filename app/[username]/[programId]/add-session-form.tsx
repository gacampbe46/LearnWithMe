"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { addProgramSession } from "./actions";
import { formLabelClass, inputFieldClass } from "@/lib/ui/typography";
import {
  addSessionInitialState,
  type AddSessionFormState,
} from "./add-session-form-state";

type Props = {
  username: string;
  programId: string;
};

const inputNormal =
  "border-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/40 dark:border-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/25";

export function AddSessionForm({ username, programId }: Props) {
  const [state, formAction, pending] = useActionState<
    AddSessionFormState,
    FormData
  >(addProgramSession, addSessionInitialState);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const canSubmit =
    title.trim().length > 0 && videoUrl.trim().length > 0 && !pending;

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="username" value={username} />
        <input type="hidden" name="program_id" value={programId} />

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
            htmlFor="session-title"
            className={formLabelClass}
          >
            Title
          </label>
          <input
            id="session-title"
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
            htmlFor="session-description"
            className={formLabelClass}
          >
            Description
          </label>
          <textarea
            id="session-description"
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
            htmlFor="session-video"
            className={formLabelClass}
          >
            Video (YouTube)
          </label>
          <input
            id="session-video"
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

        <Button type="submit" className="w-full sm:w-auto" disabled={!canSubmit}>
          {pending ? "Saving…" : "Add session"}
        </Button>
      </form>
    </Card>
  );
}
