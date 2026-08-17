"use server";

import {
  friendlyDbPermissionMessage,
  isRlsOrPermissionError,
} from "@/lib/supabase/map-db-error";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function enableInstructorForCurrentUser(): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You are not signed in." };
  }

  const { error } = await supabase
    .from("profile")
    .update({ is_instructor: true })
    .eq("user_id", user.id);

  if (error) {
    return {
      ok: false,
      error: isRlsOrPermissionError(error)
        ? friendlyDbPermissionMessage()
        : error.message,
    };
  }

  return { ok: true, error: null };
}
