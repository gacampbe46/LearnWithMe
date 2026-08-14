"use client";

import { Card } from "@/components/Card";
import {
  readSessionNotes,
  writeSessionNotes,
} from "@/lib/program/session-notes";
import {
  captionClass,
  formLabelClass,
  inputFieldClass,
  inputFocusClass,
} from "@/lib/ui/typography";
import { useEffect, useId, useRef, useState } from "react";

const SAVE_MS = 400;

type Props = {
  programId: string;
  sessionId: string;
};

export function SessionNotesField({ programId, sessionId }: Props) {
  const inputId = useId();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const dirty = useRef(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    dirty.current = false;
    setValue(readSessionNotes(programId, sessionId));
    setStatus("idle");
  }, [programId, sessionId]);

  useEffect(() => {
    if (!dirty.current) return;
    const timer = window.setTimeout(() => {
      writeSessionNotes(programId, sessionId, value);
      setStatus("saved");
    }, SAVE_MS);
    return () => window.clearTimeout(timer);
  }, [programId, sessionId, value]);

  useEffect(() => {
    return () => {
      if (dirty.current) {
        writeSessionNotes(programId, sessionId, valueRef.current);
      }
    };
  }, [programId, sessionId]);

  const statusLabel =
    status === "saving" ? "Saving…" : status === "saved" ? "Saved" : null;

  return (
    <Card>
      <div className="space-y-2">
        <label htmlFor={inputId} className={formLabelClass}>
          Your notes
        </label>
        <textarea
          id={inputId}
          rows={5}
          value={value}
          onChange={(event) => {
            dirty.current = true;
            setStatus("saving");
            setValue(event.target.value);
          }}
          placeholder="What will you try after this session?"
          className={`${inputFieldClass} ${inputFocusClass} resize-y`}
        />
        {statusLabel ? (
          <p className={captionClass} aria-live="polite">
            {statusLabel}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
