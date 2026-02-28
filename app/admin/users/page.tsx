import { requireAdmin } from "@/lib/auth/adminGuard";
import { createAdminClient } from "@/lib/supabase/admin";
import UsersClient from "./UsersClient";
import type { AdminUserRow } from "./types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  await requireAdmin();

  const admin = createAdminClient();

  // 1) profiles
  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id,email,phone,username,phone_verified,is_banned,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="rounded-2xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-200">
            Failed to load users: {error.message}
          </div>
        </div>
      </main>
    );
  }

  // 2) auth users (email_confirmed_at)
  const { data: authRes, error: authErr } = await admin.auth.admin.listUsers({
    perPage: 1000,
    page: 1,
  });

  if (authErr) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="rounded-2xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-200">
            Failed to load auth users: {authErr.message}
          </div>
        </div>
      </main>
    );
  }

  const authMap = new Map<string, boolean>();
  for (const u of authRes?.users ?? []) {
    authMap.set(u.id, Boolean(u.email_confirmed_at));
  }

  const merged = (profiles ?? []).map((p: any) => ({
    ...p,
    email_verified: authMap.get(p.id) ?? false,
  }));

  return <UsersClient initial={merged as AdminUserRow[]} />;
}