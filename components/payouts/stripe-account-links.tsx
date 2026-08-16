"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

type Intent = "update" | "login";

async function openStripe(intent: Intent): Promise<string | null> {
  const res = await fetch("/api/stripe/connect", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intent }),
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    return data.error ?? "Could not open Stripe.";
  }
  window.location.assign(data.url);
  return null;
}

export function StripeAccountLinks() {
  const [loading, setLoading] = useState<Intent | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onClick(intent: Intent) {
    setLoading(intent);
    setError(null);
    try {
      const message = await openStripe(intent);
      if (message) {
        setError(message);
        setLoading(null);
      }
    } catch {
      setError("Could not open Stripe.");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          className="min-h-11 px-5 text-sm"
          disabled={loading !== null}
          onClick={() => void onClick("update")}
        >
          {loading === "update" ? "Opening…" : "Update payout details"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 px-5 text-sm"
          disabled={loading !== null}
          onClick={() => void onClick("login")}
        >
          {loading === "login" ? "Opening…" : "Open Stripe account"}
        </Button>
      </div>
      {error ? (
        <p className="text-sm font-medium text-red-700 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
