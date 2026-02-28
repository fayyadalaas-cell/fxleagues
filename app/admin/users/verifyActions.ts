"use server";

import { requireAdmin } from "@/lib/auth/adminGuard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function adminVerifyEmail(userId: string) {
  await requireAdmin();

  const admin = createAdminClient();

  const { error } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}