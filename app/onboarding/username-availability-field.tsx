"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { parseAndValidateUsername } from "@/lib/onboarding/username";
import { bodyMutedClass, formLabelClass, inputFieldClass } from "@/lib/ui/typography";

const inputNormal =
  "border-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/40 dark:border-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/25";

const inputInvalid =
  "border-red-400/90 focus:border-red-500 focus:ring-red-400/40 dark:border-red-800/80 dark:focus:border-red-500 dark:focus:ring-red-500/30";

const inputAvailable =
  "border-emerald-500/50 focus:border-emerald-600 focus:ring-emerald-400/35 dark:border-emerald-600/50 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/25";

type Live =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "invalid"; message: string }
  | { kind: "taken" }
  | { kind: "available" }
  | { kind: "error"; message: string };

type ApiBody =
  | { status: "invalid"; message: string }
  | { status: "available"; normalized: string }
  | { status: "taken"; normalized: string }
  | { status: "unauthenticated" }
  | { status: "lookup_error"; message: string };

type Props = {
  serverError: string | null;
  /** False until format is valid, availability check succeeded on blur, and no server username error. */
  onSubmitReadyChange?: (ready: boolean) => void;
};

export function UsernameAvailabilityField({
  serverError,
  onSubmitReadyChange,
}: Props) {
  const id = useId();
  const inputId = `${id}-username`;
  const hintId = `${id}-hint`;
  const liveId = `${id}-live`;
  const serverId = `${id}-server`;

  const [value, setValue] = useState("");
  const [live, setLive] = useState<Live>({ kind: "idle" });
  const blurAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      blurAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!onSubmitReadyChange) return;
    if (serverError) {
      onSubmitReadyChange(false);
      return;
    }
    onSubmitReadyChange(live.kind === "available");
  }, [live, serverError, onSubmitReadyChange]);

  const runAvailabilityCheck = useCallback(() => {
    blurAbortRef.current?.abort();
    const ac = new AbortController();
    blurAbortRef.current = ac;

    const trimmed = value.trim();
    if (!trimmed) {
      setLive({ kind: "idle" });
      return;
    }

    const format = parseAndValidateUsername(trimmed);
    if (!format.ok) {
      setLive({ kind: "invalid", message: format.message });
      return;
    }

    setLive({ kind: "checking" });
    void (async () => {
      try {
        const res = await fetch(
          `/api/onboarding/username-available?u=${encodeURIComponent(trimmed)}`,
          { signal: ac.signal, credentials: "same-origin" },
        );
        if (ac.signal.aborted) return;
        const body = (await res.json()) as ApiBody;
        if (res.status === 401) {
          setLive({ kind: "error", message: "Sign in to check usernames." });
          return;
        }
        if (!res.ok && body.status === "lookup_error") {
          setLive({
            kind: "error",
            message: body.message ?? "Could not verify availability.",
          });
          return;
        }
        if (body.status === "invalid") {
          setLive({ kind: "invalid", message: body.message });
          return;
        }
        if (body.status === "taken") {
          setLive({ kind: "taken" });
          return;
        }
        if (body.status === "available") {
          setLive({ kind: "available" });
          return;
        }
        setLive({ kind: "error", message: "Could not verify availability." });
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (ac.signal.aborted) return;
        setLive({ kind: "error", message: "Could not verify availability." });
      }
    })();
  }, [value]);

  const handleBlur = useCallback(() => {
    runAvailabilityCheck();
  }, [runAvailabilityCheck]);

  const showServer = Boolean(serverError);
  const inputInvalidVisual =
    showServer ||
    live.kind === "invalid" ||
    live.kind === "taken" ||
    live.kind === "error";
  const inputAvailableVisual =
    !inputInvalidVisual && live.kind === "available";

  const describedBy = showServer
    ? serverId
    : live.kind === "idle"
      ? hintId
      : liveId;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className={formLabelClass}
      >
        Username
      </label>
      <input
        id={inputId}
        name="username"
        type="text"
        autoComplete="username"
        maxLength={30}
        placeholder=""
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setLive({ kind: "idle" });
        }}
        onBlur={handleBlur}
        aria-invalid={inputInvalidVisual}
        aria-describedby={describedBy}
        className={`${inputFieldClass} ${
          inputInvalidVisual
            ? inputInvalid
            : inputAvailableVisual
              ? inputAvailable
              : inputNormal
        }`}
      />

      {showServer ? (
        <p
          id={serverId}
          role="alert"
          className="text-sm leading-relaxed text-red-700 dark:text-red-300/90"
        >
          {serverError}
        </p>
      ) : (
        <>
          {live.kind === "idle" && (
            <p id={hintId} className={bodyMutedClass}>
              Lowercase letters, numbers, and underscores (3–30 characters).
              Availability is checked when you leave this field.
            </p>
          )}
          {live.kind === "checking" && (
            <p id={liveId} className={bodyMutedClass}>
              Checking availability…
            </p>
          )}
          {live.kind === "invalid" && (
            <p
              id={liveId}
              role="status"
              className="text-sm leading-relaxed text-red-700 dark:text-red-300/90"
            >
              {live.message}
            </p>
          )}
          {live.kind === "taken" && (
            <p
              id={liveId}
              role="status"
              className="text-sm leading-relaxed text-red-700 dark:text-red-300/90"
            >
              That username is already taken. Try another.
            </p>
          )}
          {live.kind === "available" && (
            <p
              id={liveId}
              role="status"
              className="text-sm font-medium leading-relaxed text-emerald-800 dark:text-emerald-200/90"
            >
              Username Available
            </p>
          )}
          {live.kind === "error" && (
            <p
              id={liveId}
              role="alert"
              className="text-sm leading-relaxed text-amber-800 dark:text-amber-200/90"
            >
              {live.message}
            </p>
          )}
        </>
      )}
    </div>
  );
}
