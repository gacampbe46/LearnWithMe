"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { StickyBottomCTA } from "@/components/StickyBottomCTA";
import { checkoutSessionStorageKey } from "@/components/program/checkout-access-sync";
import { firstIncompleteSessionId } from "@/lib/program/session-progress";
import { useCompletedSessions } from "@/lib/program/use-completed-sessions";

type Props = {
  profileSlug: string;
  programId: string;
  sessionIds: string[];
  /** When false, show Buy instead of Begin/Continue. */
  hasAccess: boolean;
  /** Display price string for the buy button (e.g. "$49"). */
  priceLabel: string;
  /** Signed-in? Buy requires auth. */
  isSignedIn: boolean;
  /** Returning from Stripe Checkout but entitlement is not visible yet. */
  checkoutPending?: boolean;
};

export function BeginProgramCta({
  profileSlug,
  programId,
  sessionIds,
  hasAccess,
  priceLabel,
  isSignedIn,
  checkoutPending = false,
}: Props) {
  const completed = useCompletedSessions(programId);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  const nextId =
    firstIncompleteSessionId(sessionIds, [...completed]) ?? sessionIds[0];
  if (!nextId && hasAccess) return null;

  const allDone =
    sessionIds.length > 0 && sessionIds.every((id) => completed.has(id));
  const href = nextId ? `/${profileSlug}/${programId}/${nextId}` : null;

  async function startCheckout() {
    if (!isSignedIn) {
      window.location.href = `/login?next=${encodeURIComponent(`/${profileSlug}/${programId}`)}`;
      return;
    }
    setBuying(true);
    setBuyError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId }),
      });
      const data = (await res.json()) as {
        url?: string;
        sessionId?: string;
        alreadyPaid?: boolean;
        error?: string;
      };
      if (data.alreadyPaid) {
        window.location.reload();
        return;
      }
      if (!res.ok || !data.url) {
        setBuyError(data.error ?? "Could not start checkout.");
        setBuying(false);
        return;
      }
      if (data.sessionId) {
        try {
          window.sessionStorage.setItem(
            checkoutSessionStorageKey(programId),
            data.sessionId,
          );
        } catch {
          /* ignore */
        }
      }
      window.location.href = data.url;
    } catch {
      setBuyError("Could not start checkout.");
      setBuying(false);
    }
  }

  if (!hasAccess) {
    if (checkoutPending) {
      return (
        <StickyBottomCTA>
          <Button
            type="button"
            disabled
            className="min-h-12 w-full max-w-sm"
          >
            Opening your program…
          </Button>
        </StickyBottomCTA>
      );
    }

    return (
      <StickyBottomCTA>
        <div className="flex w-full max-w-sm flex-col items-center gap-2">
          <Button
            type="button"
            onClick={startCheckout}
            disabled={buying}
            className="min-h-12 w-full"
          >
            {buying
              ? "Redirecting…"
              : isSignedIn
                ? `Buy program — ${priceLabel}`
                : "Sign in to buy"}
          </Button>
          {buyError ? (
            <p
              className="text-center text-sm font-medium text-red-700 dark:text-red-400"
              role="alert"
            >
              {buyError}
            </p>
          ) : null}
        </div>
      </StickyBottomCTA>
    );
  }

  if (!href) return null;

  return (
    <StickyBottomCTA>
      <Button href={href} className="min-h-12 w-full max-w-sm">
        {allDone
          ? "Review program"
          : completed.size > 0
            ? "Continue program"
            : "Begin program"}
      </Button>
    </StickyBottomCTA>
  );
}
