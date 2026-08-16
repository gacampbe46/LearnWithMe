import { ConnectPayoutsButton } from "@/components/teach/connect-payouts-button";
import { getStripe } from "@/lib/stripe/client";
import {
  loadCreatorStripeStatus,
  syncStripeAccountToProfile,
} from "@/lib/stripe/connect-db";
import { STRIPE_PLATFORM_FEE_PERCENT } from "@/lib/stripe/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTeachingProfile } from "@/lib/teach/teaching-profile";
import { pageFocusedColumnClass, pageMainStickyClass } from "@/lib/ui/page-layout";
import {
  navLinkClass,
  subtitleSmClass,
  titleDisplayClass,
} from "@/lib/ui/typography";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

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

export default async function TeachPayoutsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/teach/payouts")}`);
  }

  const profile = await getTeachingProfile(supabase, user.id);
  if (!profile) {
    redirect(`/onboarding?next=${encodeURIComponent("/teach/payouts")}`);
  }

  let status = await loadCreatorStripeStatus(supabase, profile.id);

  if (status.stripeAccountId && (params.return === "1" || params.refresh === "1")) {
    try {
      const stripe = getStripe();
      const account = await stripe.accounts.retrieve(status.stripeAccountId);
      await syncStripeAccountToProfile(account);
      status = await loadCreatorStripeStatus(supabase, profile.id);
    } catch {
      // Keep existing DB status if Stripe sync fails on return.
    }
  }

  const ready = status.chargesEnabled;
  const creatorKeepPercent = 100 - STRIPE_PLATFORM_FEE_PERCENT;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className={`${pageMainStickyClass}`}>
        <div className={`${pageFocusedColumnClass} space-y-8`}>
          <nav>
            <Link href="/teach/programs/new" className={navLinkClass}>
              ← Create program
            </Link>
          </nav>

          <header className="space-y-2">
            <h1 className={titleDisplayClass}>Payouts</h1>
            <p className={subtitleSmClass}>
              A one-time Stripe setup so you can get paid whenever someone buys a
              program. You keep {creatorKeepPercent}% — LearnWithMe takes{" "}
              {STRIPE_PLATFORM_FEE_PERCENT}%.
            </p>
          </header>

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
                {statusCopy({
                  ready,
                  detailsSubmitted: status.detailsSubmitted,
                  hasAccount: Boolean(status.stripeAccountId),
                })}
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
                : params.refresh === "1"
                  ? "No worries — pick up where you left off and finish this one-time setup."
                  : "Free programs can go live anytime. Paid ones just need this one-time setup first."}
            </p>

            <ConnectPayoutsButton
              chargesEnabled={status.chargesEnabled}
              detailsSubmitted={status.detailsSubmitted}
              hasAccount={Boolean(status.stripeAccountId)}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
