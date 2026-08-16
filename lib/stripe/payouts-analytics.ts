import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { monthKey, monthLabel } from "@/lib/stripe/money";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type ProgramSale = {
  id: string;
  date: Date;
  programTitle: string;
  buyerName: string;
  buyerHandle: string | null;
  amountCents: number;
  netCents: number;
  currency: string;
  status: "active" | "refunded";
};

export type MonthlyEarning = {
  key: string;
  label: string;
  cents: number;
  soldCount: number;
};

export type UpcomingPayout = {
  amountCents: number;
  arrivalDate: Date;
};

export type PayoutsAnalytics = {
  currency: string;
  upcomingPayout: UpcomingPayout | null;
  payoutCadence: string;
  monthlyEarnings: MonthlyEarning[];
  sales: ProgramSale[];
  programsSoldCount: number;
};

function sumBalanceFunds(funds: Stripe.Balance.Available[]): number {
  return funds.reduce((sum, row) => sum + (row.amount ?? 0), 0);
}

function lastTwelveMonths(): MonthlyEarning[] {
  const months: MonthlyEarning[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), label: monthLabel(d), cents: 0, soldCount: 0 });
  }
  return months;
}

function chartWindowStart(): Date {
  const start = new Date();
  start.setMonth(start.getMonth() - 11, 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function delayDays(schedule: Stripe.Account.Settings.Payouts.Schedule): number {
  const value = schedule.delay_days;
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  return 2;
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function weekdayIndex(name: string | undefined): number {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const i = days.indexOf((name ?? "monday").toLowerCase());
  return i >= 0 ? i : 1;
}

function nextPayoutDayOnOrAfter(
  schedule: Stripe.Account.Settings.Payouts.Schedule | undefined,
  from: Date,
): Date | null {
  if (!schedule || schedule.interval === "manual") return null;
  if (schedule.interval === "daily") {
    return from;
  }
  if (schedule.interval === "weekly") {
    const want = weekdayIndex(schedule.weekly_anchor);
    const diff = (want - from.getUTCDay() + 7) % 7;
    return addUtcDays(from, diff);
  }
  if (schedule.interval === "monthly") {
    const anchor = Math.min(28, Math.max(1, schedule.monthly_anchor ?? 1));
    let candidate = new Date(
      Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), anchor),
    );
    if (candidate.getTime() < from.getTime()) {
      candidate = new Date(
        Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, anchor),
      );
    }
    return candidate;
  }
  return from;
}

function fundsReadyOnFromTransactions(
  transactions: Stripe.BalanceTransaction[],
  fallback: Date,
): Date {
  const nowSec = Math.floor(Date.now() / 1000);
  const pendingAvailableOn = transactions
    .map((tx) => tx.available_on)
    .filter((ts): ts is number => typeof ts === "number" && ts >= nowSec);
  if (pendingAvailableOn.length === 0) return fallback;
  return new Date(Math.max(...pendingAvailableOn) * 1000);
}

function payoutCadenceCopy(
  schedule: Stripe.Account.Settings.Payouts.Schedule | undefined,
): string {
  if (!schedule || schedule.interval === "manual") {
    return "Payouts are sent when you request them from Stripe.";
  }
  const delay = delayDays(schedule);
  if (schedule.interval === "daily") {
    return `Stripe usually sends payouts about ${delay} day${delay === 1 ? "" : "s"} after a sale.`;
  }
  if (schedule.interval === "weekly") {
    const day = (schedule.weekly_anchor ?? "monday").replace(/^\w/, (c) =>
      c.toUpperCase(),
    );
    return `Stripe usually sends payouts weekly on ${day}s.`;
  }
  if (schedule.interval === "monthly") {
    return "Stripe usually sends payouts once a month.";
  }
  return "Stripe sends payouts on a regular schedule after each sale.";
}

function entitlementNetCents(amount: unknown, fee: unknown): number {
  const amountCents =
    typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  const feeCents = typeof fee === "number" && Number.isFinite(fee) ? fee : 0;
  return Math.max(0, amountCents - feeCents);
}

function displayName(row: {
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
}): { name: string; handle: string | null } {
  const first = typeof row.first_name === "string" ? row.first_name.trim() : "";
  const last = typeof row.last_name === "string" ? row.last_name.trim() : "";
  const full = `${first} ${last}`.trim();
  const username =
    typeof row.username === "string" && row.username.trim()
      ? row.username.trim()
      : null;
  return {
    name: full || (username ? `@${username}` : "Learner"),
    handle: username,
  };
}

async function loadCreatorSales(
  creatorProfileId: string,
): Promise<{
  sales: ProgramSale[];
  totalSoldCount: number;
  monthly: MonthlyEarning[];
}> {
  const monthly = lastTwelveMonths();
  const empty = { sales: [] as ProgramSale[], totalSoldCount: 0, monthly };
  const service = createSupabaseServiceClient();
  const { data: programs, error: programsErr } = await service
    .from("programs")
    .select("id, title")
    .eq("profile_id", creatorProfileId);

  if (programsErr || !programs?.length) return empty;

  const programTitle = new Map<string, string>();
  for (const program of programs) {
    if (typeof program.id !== "string") continue;
    const title =
      typeof program.title === "string" && program.title.trim()
        ? program.title.trim()
        : "Program";
    programTitle.set(program.id, title);
  }

  const programIds = [...programTitle.keys()];
  const { count } = await service
    .from("program_entitlements")
    .select("id", { count: "exact", head: true })
    .in("program_id", programIds)
    .eq("status", "active");

  const { data: chartRows } = await service
    .from("program_entitlements")
    .select("created_at, amount_cents, application_fee_cents, status")
    .in("program_id", programIds)
    .gte("created_at", chartWindowStart().toISOString());

  const byKey = new Map(monthly.map((month) => [month.key, month]));
  for (const row of chartRows ?? []) {
    if (row.status !== "active") continue;
    const created =
      typeof row.created_at === "string" ? new Date(row.created_at) : null;
    if (!created || Number.isNaN(created.getTime())) continue;
    const bucket = byKey.get(monthKey(created));
    if (!bucket) continue;
    bucket.cents += entitlementNetCents(
      row.amount_cents,
      row.application_fee_cents,
    );
    bucket.soldCount += 1;
  }

  const { data: rows, error: salesErr } = await service
    .from("program_entitlements")
    .select(
      "id, created_at, user_id, program_id, amount_cents, application_fee_cents, currency, status",
    )
    .in("program_id", programIds)
    .order("created_at", { ascending: false })
    .limit(50);

  if (salesErr || !rows?.length) {
    return { sales: [], totalSoldCount: count ?? 0, monthly };
  }

  const buyerIds = [
    ...new Set(
      rows
        .map((row) => (typeof row.user_id === "string" ? row.user_id : null))
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const { data: buyers } = buyerIds.length
    ? await service
        .from("profile")
        .select("user_id, username, first_name, last_name")
        .in("user_id", buyerIds)
    : { data: [] as Array<Record<string, unknown>> };

  const buyerByUserId = new Map<string, ReturnType<typeof displayName>>();
  for (const buyer of buyers ?? []) {
    if (typeof buyer.user_id !== "string") continue;
    buyerByUserId.set(buyer.user_id, displayName(buyer));
  }

  return {
    totalSoldCount: count ?? rows.length,
    monthly,
    sales: rows.flatMap((row) => {
      if (typeof row.id !== "string" || typeof row.program_id !== "string") {
        return [];
      }
      const amount =
        typeof row.amount_cents === "number" && Number.isFinite(row.amount_cents)
          ? row.amount_cents
          : 0;
      const buyer = buyerByUserId.get(
        typeof row.user_id === "string" ? row.user_id : "",
      ) ?? { name: "Learner", handle: null };
      const created =
        typeof row.created_at === "string"
          ? new Date(row.created_at)
          : new Date();
      return [
        {
          id: row.id,
          date: created,
          programTitle: programTitle.get(row.program_id) ?? "Program",
          buyerName: buyer.name,
          buyerHandle: buyer.handle,
          amountCents: amount,
          netCents: entitlementNetCents(amount, row.application_fee_cents),
          currency:
            typeof row.currency === "string" && row.currency.trim()
              ? row.currency.trim()
              : "usd",
          status: row.status === "refunded" ? "refunded" : "active",
        } satisfies ProgramSale,
      ];
    }),
  };
}

function thisMonthFromStripeTransactions(
  transactions: Stripe.BalanceTransaction[],
): { cents: number; saleCount: number } {
  const now = new Date();
  const start = Math.floor(
    new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000,
  );
  let cents = 0;
  let saleCount = 0;
  for (const tx of transactions) {
    if (tx.created < start) continue;
    if (tx.type === "payout" || tx.type === "stripe_fee") continue;
    if (tx.reporting_category === "payout" || tx.reporting_category === "fee") {
      continue;
    }
    cents += tx.net;
    saleCount += 1;
  }
  return { cents: Math.max(0, cents), saleCount };
}

export async function loadPayoutsAnalytics(
  accountId: string,
  creatorProfileId: string,
): Promise<PayoutsAnalytics> {
  const empty: PayoutsAnalytics = {
    currency: "usd",
    upcomingPayout: null,
    payoutCadence: "Stripe sends payouts on a regular schedule after each sale.",
    monthlyEarnings: lastTwelveMonths(),
    sales: [],
    programsSoldCount: 0,
  };

  const loadedSales = await loadCreatorSales(creatorProfileId).catch(() => ({
    sales: [] as ProgramSale[],
    totalSoldCount: 0,
    monthly: lastTwelveMonths(),
  }));
  const sales = loadedSales.sales;
  const programsSoldCount = loadedSales.totalSoldCount;
  const monthlyEarnings = loadedSales.monthly;

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return { ...empty, monthlyEarnings, sales, programsSoldCount };
  }

  const opts = { stripeAccount: accountId };

  try {
    const [balance, payouts, account, txPage] = await Promise.all([
      stripe.balance.retrieve(undefined, opts),
      stripe.payouts.list({ limit: 10 }, opts),
      stripe.accounts.retrieve(accountId),
      stripe.balanceTransactions.list({ limit: 40 }, opts),
    ]);

    const totalBalanceCents =
      sumBalanceFunds(balance.available) + sumBalanceFunds(balance.pending);
    const currency =
      balance.available[0]?.currency ??
      balance.pending[0]?.currency ??
      sales[0]?.currency ??
      "usd";
    const schedule = account.settings?.payouts?.schedule;
    const cadence = payoutCadenceCopy(schedule);

    const pendingPayout = payouts.data.find(
      (payout) => payout.status === "pending" || payout.status === "in_transit",
    );

    let upcomingPayout: UpcomingPayout | null = null;
    if (pendingPayout) {
      upcomingPayout = {
        amountCents: pendingPayout.amount,
        arrivalDate: new Date(pendingPayout.arrival_date * 1000),
      };
    } else if (totalBalanceCents > 0) {
      const fundsReadyOn = fundsReadyOnFromTransactions(
        txPage.data,
        addUtcDays(new Date(), schedule ? delayDays(schedule) : 2),
      );
      const arrival = nextPayoutDayOnOrAfter(schedule, fundsReadyOn);
      if (arrival) {
        upcomingPayout = {
          amountCents: totalBalanceCents,
          arrivalDate: arrival,
        };
      }
    }

    const last = monthlyEarnings.at(-1);
    const fromDb = {
      cents: last?.cents ?? 0,
      saleCount: last?.soldCount ?? 0,
    };
    const fromStripe = thisMonthFromStripeTransactions(txPage.data);
    const thisMonth =
      fromDb.saleCount > 0 || fromDb.cents > 0 ? fromDb : fromStripe;

    if (last && last.cents === 0 && thisMonth.cents > 0) {
      last.cents = thisMonth.cents;
    }
    if (last && last.soldCount === 0 && last.cents > 0) {
      last.soldCount = Math.max(1, thisMonth.saleCount);
    }

    const monthlySold = monthlyEarnings.reduce(
      (sum, month) => sum + month.soldCount,
      0,
    );

    return {
      currency,
      upcomingPayout,
      payoutCadence: cadence,
      monthlyEarnings,
      sales,
      programsSoldCount: Math.max(programsSoldCount, monthlySold),
    };
  } catch {
    return { ...empty, monthlyEarnings, sales, programsSoldCount };
  }
}
