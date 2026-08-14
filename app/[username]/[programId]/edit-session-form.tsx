"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SessionVideoUploadField } from "@/components/session-video-upload-field";
import {
  addSessionInitialState,
  type AddSessionFormState,
} from "./add-session-form-state";
import { formLabelClass, inputFieldClass, inputFocusClass } from "@/lib/ui/typography";
import { updateProgramSession } from "./actions";
import { parseGumletAssetId } from "@/lib/gumlet/asset-id";

type Props = {
  username: string;
  programId: string;
  sessionId: string;
  initialTitle: string;
  initialDescription: string;
  initialVideoInput: string;
};

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

  const initialAssetId = parseGumletAssetId(initialVideoInput) ?? "";
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [assetId, setAssetId] = useState(initialAssetId);
  const [videoBusy, setVideoBusy] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setAssetId(parseGumletAssetId(initialVideoInput) ?? "");
  }, [sessionId, initialTitle, initialDescription, initialVideoInput]);

  const isDirty = useMemo(
    () =>
      title.trim() !== initialTitle.trim() ||
      description.trim() !== initialDescription.trim() ||
      (parseGumletAssetId(assetId) ?? "") !== initialAssetId,
    [
      title,
      description,
      assetId,
      initialTitle,
      initialDescription,
      initialAssetId,
    ],
  );

  const canSubmit =
    isDirty && title.trim().length > 0 && !pending && !videoBusy;

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
            className={`${inputFieldClass} ${inputFocusClass}`}
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
            className={`${inputFieldClass} ${inputFocusClass} resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <SessionVideoUploadField
          programId={programId}
          assetId={assetId}
          onAssetIdChange={setAssetId}
          onBusyChange={setVideoBusy}
          disabled={pending}
          hasExisting={Boolean(initialAssetId)}
        />

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
