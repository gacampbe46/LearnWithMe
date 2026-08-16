import { ConnectPayoutsButton } from "@/components/teach/connect-payouts-button";
import { PayoutsAnalyticsPanel } from "@/components/payouts/payouts-analytics-panel";
import { PayoutsReturnReveal } from "@/components/payouts/payouts-return-reveal";
import { PAYOUTS_PATH } from "@/lib/app-paths";
import { getStripe } from "@/lib/stripe/client";
import {
  loadCreatorStripeStatus,
  syncStripeAccountToProfile,
} from "@/lib/stripe/connect-db";
import { STRIPE_PLATFORM_FEE_PERCENT } from "@/lib/stripe/env";
import { loadPayoutsAnalytics } from "@/lib/stripe/payouts-analytics";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTeachingProfile } from "@/lib/teach/teaching-profile";
import { pageFocusedColumnClass, pageMainClass } from "@/lib/ui/page-layout";
import { subtitleSmClass, titleDisplayClass } from "@/lib/ui/typography";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payouts — learnwithme",
  description: "Connect Stripe so you can get paid for your programs.",
};

type PageProps = {
  searchParams: Promise<{ return?: string; refresh?: string }>;
};

function statusCopy(input: {
  ready: boolean;
  detailsSubmitted: boolean;
  hasAccount: boolean;
}) {
  if (input.ready) return "You're all set";
  if (input.detailsSubmitted) return "Stripe is reviewing";
  if (input.hasAccount) return "Almost there";
  return "Not connected yet";
}

function SetupCard({
  ready,
  detailsSubmitted,
  hasAccount,
  creatorKeepPercent,
}: {
  ready: boolean;
  detailsSubmitted: boolean;
  hasAccount: boolean;
  creatorKeepPercent: number;
}) {
  return (
    <section className="space-y-5 rounded-3xl border border-editorial-border bg-editorial-card p-5 shadow-sm shadow-stone-900/5 sm:p-6 dark:shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
            ready
              ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100"
              : "bg-[#f3e7d4] text-stone-800 dark:bg-stone-800 dark:text-stone-100"
          }`}
        >
          <span
            aria-hidden
            className={`size-1.5 rounded-full ${
              ready ? "bg-emerald-600 dark:bg-emerald-400" : "bg-editorial-accent"
            }`}
          />
          {statusCopy({ ready, detailsSubmitted, hasAccount })}
        </span>
        <div className="flex gap-1.5">
          <span className="rounded-full border border-editorial-border bg-background px-2.5 py-1 text-[11px] font-medium text-stone-700 dark:text-stone-300">
            You {creatorKeepPercent}%
          </span>
          <span className="rounded-full border border-editorial-border bg-background px-2.5 py-1 text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Platform {STRIPE_PLATFORM_FEE_PERCENT}%
          </span>
        </div>
      </div>

      <p className={subtitleSmClass}>
        {ready
          ? "Payouts are ready — you can publish paid programs whenever you like."
          : detailsSubmitted
            ? "Stripe is finishing review — this page will show your payouts once they are enabled."
            : hasAccount
              ? "Pick up where you left off and finish this one-time setup."
              : "Free programs can go live anytime. Paid ones just need this one-time setup first."}
      </p>

      {ready ? null : (
        <ConnectPayoutsButton
          chargesEnabled={false}
          detailsSubmitted={detailsSubmitted}
          hasAccount={hasAccount}
        />
      )}
    </section>
  );
}

export default async function PayoutsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(PAYOUTS_PATH)}`);
  }

  const profile = await getTeachingProfile(supabase, user.id);
  if (!profile) {
    redirect(`/onboarding?next=${encodeURIComponent(PAYOUTS_PATH)}`);
  }
  if (!profile.isInstructor) {
    redirect("/");
  }

  let status = await loadCreatorStripeStatus(profile.id);

  if (status.stripeAccountId) {
    try {
      const stripe = getStripe();
      const account = await stripe.accounts.retrieve(status.stripeAccountId);
      await syncStripeAccountToProfile(account);
      status = {
        stripeAccountId: account.id,
        chargesEnabled: account.charges_enabled === true,
        detailsSubmitted: account.details_submitted === true,
      };
    } catch {
      // Keep existing DB status if Stripe sync fails.
    }
  }

  const justReturned = params.return === "1" || params.refresh === "1";
  const connected = Boolean(status.stripeAccountId) && status.detailsSubmitted;
  const ready = status.chargesEnabled || connected;
  const creatorKeepPercent = 100 - STRIPE_PLATFORM_FEE_PERCENT;
  const analytics =
    connected && status.stripeAccountId
      ? await loadPayoutsAnalytics(status.stripeAccountId, profile.id)
      : null;

  const setup = (
    <SetupCard
      ready={ready}
      detailsSubmitted={status.detailsSubmitted}
      hasAccount={Boolean(status.stripeAccountId)}
      creatorKeepPercent={creatorKeepPercent}
    />
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <main className={`${pageMainClass} space-y-8`}>
        <div className={analytics ? "space-y-8" : `${pageFocusedColumnClass} space-y-8`}>
          <header className="space-y-2">
            <h1 className={titleDisplayClass}>Payouts</h1>
            {analytics ? null : (
              <p className={subtitleSmClass}>
                A one-time Stripe setup so you can get paid whenever someone buys a
                program. You keep {creatorKeepPercent}% — LearnWithMe takes{" "}
                {STRIPE_PLATFORM_FEE_PERCENT}%.
              </p>
            )}
          </header>

          {analytics ? (
            <PayoutsReturnReveal justReturned={justReturned} intro={setup}>
              <PayoutsAnalyticsPanel analytics={analytics} />
            </PayoutsReturnReveal>
          ) : (
            setup
          )}
        </div>
      </main>
    </div>
  );
}
