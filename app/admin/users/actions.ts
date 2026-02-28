"use server";

import { requireAdmin } from "@/lib/auth/adminGuard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function adminUpdateUsername(userId: string, username: string) {
  await requireAdmin();

  const clean = (username || "").trim().toLowerCase();

  // قواعد بسيطة (اختيارية)
  if (clean.length < 3) return { ok: false, error: "Username too short" };
  if (clean.length > 20) return { ok: false, error: "Username too long" };
  if (!/^[a-z0-9_]+$/.test(clean))
    return { ok: false, error: "Only letters, numbers, underscore" };

  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ username: clean })
    .eq("id", userId);

  if (error) {
    // لو username موجود عند شخص ثاني، رح يطلع unique violation
    return { ok: false, error: error.message };
  }

  return { ok: true };
}