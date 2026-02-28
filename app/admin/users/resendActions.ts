"use server";

import { requireAdmin } from "@/lib/auth/adminGuard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function adminResendVerification(email: string) {
  await requireAdmin();

  const admin = createAdminClient();

  const { error } = await admin.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL || undefined,
    },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}