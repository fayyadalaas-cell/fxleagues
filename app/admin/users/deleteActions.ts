"use server";

import { requireAdmin } from "@/lib/auth/adminGuard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function adminDeleteUser(userId: string) {
  await requireAdmin();

  const admin = createAdminClient();

  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}