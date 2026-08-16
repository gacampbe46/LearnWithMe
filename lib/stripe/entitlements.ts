import type { SupabaseClient } from "@supabase/supabase-js";
import { isPaidProgramPrice } from "@/lib/stripe/fees";

/**
 * Whether the viewer may open program sessions.
 * Free programs, owners, and active entitlements are allowed.
 */
export async function userHasProgramAccess(options: {
  supabase: SupabaseClient;
  programId: string;
  priceValue: number | null | undefined;
  canManage: boolean;
  userId: string | null | undefined;
}): Promise<boolean> {
  const { supabase, programId, priceValue, canManage, userId } = options;

  if (canManage) return true;
  if (!isPaidProgramPrice(priceValue)) return true;
  if (!userId) return false;

  const { data, error } = await supabase
    .from("program_entitlements")
    .select("id")
    .eq("user_id", userId)
    .eq("program_id", programId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[userHasProgramAccess]", error.message);
    }
    return false;
  }

  return Boolean(data?.id);
}
