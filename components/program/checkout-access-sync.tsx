"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SESSION_STORAGE_KEY = "lwm-checkout-session";

export function checkoutSessionStorageKey(programId: string): string {
  return `${SESSION_STORAGE_KEY}:${programId}`;
}

function readStoredSessionId(programId: string, fallback: string): string {
  try {
    return (
      fallback ||
      window.sessionStorage.getItem(checkoutSessionStorageKey(programId)) ||
      ""
    );
  } catch {
    return fallback;
  }
}

function clearStoredSessionId(programId: string) {
  try {
    window.sessionStorage.removeItem(checkoutSessionStorageKey(programId));
  } catch {
    /* ignore */
  }
}

type Props = {
  programId: string;
  sessionId?: string;
};

export function CheckoutAccessSync({ programId, sessionId }: Props) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const storedSessionId = readStoredSessionId(programId, sessionId ?? "");

    function revealProgram() {
      if (cancelled) return;
      clearStoredSessionId(programId);
      router.replace(window.location.pathname);
      router.refresh();
    }

    async function completeOnce(): Promise<boolean> {
      const res = await fetch("/api/stripe/checkout/complete", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId,
          ...(storedSessionId ? { sessionId: storedSessionId } : {}),
        }),
      });
      const data = (await res.json()) as { hasAccess?: boolean };
      return data.hasAccess === true;
    }

    async function checkAccess(): Promise<boolean> {
      const res = await fetch(
        `/api/stripe/checkout/complete?programId=${encodeURIComponent(programId)}`,
        { credentials: "same-origin", cache: "no-store" },
      );
      if (!res.ok) return false;
      const data = (await res.json()) as { hasAccess?: boolean };
      return data.hasAccess === true;
    }

    async function unlock() {
      try {
        if (await completeOnce()) {
          revealProgram();
          return;
        }
      } catch {
        /* keep polling */
      }

      const started = Date.now();
      let ticks = 0;
      while (!cancelled && Date.now() - started < 45_000) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        if (cancelled) return;
        ticks += 1;
        try {
          const hasAccess =
            storedSessionId || ticks % 4 === 0
              ? await completeOnce()
              : await checkAccess();
          if (hasAccess) {
            revealProgram();
            return;
          }
        } catch {
          /* retry */
        }
      }
    }

    void unlock();
    return () => {
      cancelled = true;
    };
  }, [programId, router, sessionId]);

  return null;
}
