import Link from "next/link";
import { PAYOUTS_SETUP_REQUIRED_MESSAGE } from "@/lib/stripe/publish-guard";

const errorClass =
  "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-100";

const noticeClass =
  "rounded-xl border border-editorial-border bg-[#f3e7d4]/70 px-4 py-3 text-sm leading-relaxed text-stone-800 dark:border-editorial-accent dark:bg-[#3f362c] dark:text-stone-100";

type Props = {
  message: string;
};

export function FormErrorAlert({ message }: Props) {
  const isPayoutsNotice = message === PAYOUTS_SETUP_REQUIRED_MESSAGE;

  return (
    <p
      role={isPayoutsNotice ? "status" : "alert"}
      className={isPayoutsNotice ? noticeClass : errorClass}
    >
      {isPayoutsNotice ? (
        <>
          Finish Payout setup before publishing a paid program.{" "}
          <Link
            href="/payouts"
            className="font-medium text-stone-900 underline decoration-editorial-accent underline-offset-2 dark:text-white"
          >
            Set up Payouts
          </Link>
          .
          <span className="mt-1 block">
            Only free programs can go live without setting up Payouts.
          </span>
        </>
      ) : (
        message
      )}
    </p>
  );
}
