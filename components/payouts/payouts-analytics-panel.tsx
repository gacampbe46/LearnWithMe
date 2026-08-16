import { Card } from "@/components/Card";
import { MonthTrendChart } from "@/components/payouts/month-trend-chart";
import { StripeAccountLinks } from "@/components/payouts/stripe-account-links";
import type { PayoutsAnalytics } from "@/lib/stripe/payouts-analytics";
import {
  formatCompactUsdFromCents,
  formatShortDate,
  formatUsdFromCents,
  formatWeekdayDate,
} from "@/lib/stripe/money";
import {
  captionClass,
  subtitleSmClass,
  titleCardClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";

type Props = {
  analytics: PayoutsAnalytics;
};

export function PayoutsAnalyticsPanel({ analytics }: Props) {
  const currency = analytics.currency;
  const earnedCents = analytics.monthlyEarnings.reduce(
    (sum, month) => sum + month.cents,
    0,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <p className={`max-w-xl ${subtitleSmClass}`}>
          Sales of your LearnWithMe programs, who bought them, and when Stripe
          should pay you.
        </p>
        <StripeAccountLinks />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-2">
          <p className={captionClass}>Next payout</p>
          {analytics.upcomingPayout ? (
            <>
              <p className="font-serif-display text-3xl font-semibold leading-tight text-stone-900 dark:text-stone-50">
                {formatUsdFromCents(analytics.upcomingPayout.amountCents, currency)}
              </p>
              <p className={titleCardClass}>
                Expected to arrive {formatWeekdayDate(analytics.upcomingPayout.arrivalDate)}
              </p>
              <p className={captionClass}>{analytics.payoutCadence}</p>
            </>
          ) : (
            <>
              <p className="font-serif-display text-3xl font-semibold leading-tight text-stone-900 dark:text-stone-50">
                None scheduled
              </p>
              <p className={captionClass}>{analytics.payoutCadence}</p>
            </>
          )}
        </Card>

        <Card className="space-y-2">
          <p className={captionClass}>Earned this month</p>
          <p className="font-serif-display text-3xl font-semibold leading-tight text-stone-900 dark:text-stone-50">
            {formatUsdFromCents(
              analytics.monthlyEarnings.at(-1)?.cents ?? 0,
              currency,
            )}
          </p>
          <p className={captionClass}>Your share of program sales this month</p>
        </Card>

        <Card className="space-y-2">
          <p className={captionClass}>Earned on LearnWithMe</p>
          <p className="font-serif-display text-3xl font-semibold leading-tight text-stone-900 dark:text-stone-50">
            {formatUsdFromCents(earnedCents, currency)}
          </p>
          <p className={captionClass}>
            Your share of program sales in the past 12 months
          </p>
        </Card>

        <Card className="space-y-2">
          <p className={captionClass}>Programs sold</p>
          <p className="font-serif-display text-3xl font-semibold leading-tight text-stone-900 dark:text-stone-50">
            {analytics.programsSoldCount.toLocaleString("en-US")}
          </p>
          <p className={captionClass}>Total program sales on LearnWithMe</p>
        </Card>
      </div>

      <MonthTrendChart
        title="Earnings by month"
        months={analytics.monthlyEarnings.map((month) => ({
          key: month.key,
          label: month.label,
          value: month.cents,
          display: formatCompactUsdFromCents(month.cents, currency),
        }))}
      />

      <MonthTrendChart
        title="Programs sold by month"
        months={analytics.monthlyEarnings.map((month) => ({
          key: month.key,
          label: month.label,
          value: month.soldCount,
          display: month.soldCount.toLocaleString("en-US"),
        }))}
      />

      <Card className="space-y-4 overflow-hidden">
        <div>
          <h2 className={titleSubsectionClass}>Program sales</h2>
          <p className={`mt-1 ${captionClass}`}>
            Who bought which program, and what you keep
          </p>
        </div>
        {analytics.sales.length === 0 ? (
          <p className={subtitleSmClass}>
            When someone buys one of your programs, the sale will show up here
            with their name and the program title.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="border-y border-editorial-border text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  <th className="py-2 pr-4 font-medium">Program</th>
                  <th className="py-2 pr-4 font-medium">Bought by</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium text-right">Paid</th>
                  <th className="py-2 font-medium text-right">You received</th>
                </tr>
              </thead>
              <tbody>
                {analytics.sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-editorial-border/80 text-stone-800 last:border-b-0 dark:text-stone-200"
                  >
                    <td className="py-3 pr-4 font-medium">{sale.programTitle}</td>
                    <td className="py-3 pr-4">
                      <span className="block">{sale.buyerName}</span>
                      {sale.buyerHandle && !sale.buyerName.startsWith("@") ? (
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          @{sale.buyerHandle}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4">{formatShortDate(sale.date)}</td>
                    <td className="py-3 pr-4 text-right">
                      {formatUsdFromCents(sale.amountCents, sale.currency)}
                    </td>
                    <td className="py-3 text-right">
                      {sale.status === "refunded" ? (
                        <span className="text-stone-500">Refunded</span>
                      ) : (
                        formatUsdFromCents(sale.netCents, sale.currency)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
