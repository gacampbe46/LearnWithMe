import type { SupabaseClient } from "@supabase/supabase-js";
import { isPaidProgramPrice } from "@/lib/stripe/fees";
import { loadCreatorStripeStatus } from "@/lib/stripe/connect-db";

/** Plain-text fallback when the payouts-required alert cannot render a link. */
export const PAYOUTS_SETUP_REQUIRED_MESSAGE =
  "Finish Payout setup before publishing a paid program. Only free programs can go live without setting up Payouts.";

/**
 * Paid programs require Connect charges_enabled before learner visibility.
 */
export async function assertCanPublishPaidProgram(
  supabase: SupabaseClient,
  options: {
    profileId: string;
    priceValue: number | null | undefined;
    wantActive: boolean;
  },
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!options.wantActive || !isPaidProgramPrice(options.priceValue)) {
    return { ok: true };
  }

  const status = await loadCreatorStripeStatus(supabase, options.profileId);
  if (!status.chargesEnabled) {
    return {
      ok: false,
      message: PAYOUTS_SETUP_REQUIRED_MESSAGE,
    };
  }

  return { ok: true };
}
