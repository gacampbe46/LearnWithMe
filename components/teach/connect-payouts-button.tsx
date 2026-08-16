"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

type Props = {
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  hasAccount: boolean;
};

export function ConnectPayoutsButton({
  chargesEnabled,
  detailsSubmitted,
  hasAccount,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = chargesEnabled
    ? "Update payout details"
    : detailsSubmitted || hasAccount
      ? "Finish setup"
      : "Connect Stripe";

  async function startOnboarding() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start Stripe onboarding.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not start Stripe onboarding.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={startOnboarding}
        disabled={loading}
        className="min-h-11 w-full text-sm"
      >
        {loading ? "Redirecting…" : label}
      </Button>
      {error ? (
        <p className="text-sm font-medium text-red-700 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
