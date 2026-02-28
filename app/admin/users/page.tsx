import { requireAdmin } from "@/lib/auth/adminGuard";
import { createAdminClient } from "@/lib/supabase/admin";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export type AdminUserRow = {
  id: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  phone_verified: boolean | null;
  is_banned: boolean | null;
  created_at?: string | null;
};

export default async function Page() {
  // ✅ Admin guard (server)
  await requireAdmin();

  // ✅ Use service role client to bypass RLS safely (admin-only page)
  const admin = createAdminClient();

  const { data, error } = await admin
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

  return <UsersClient initial={(data ?? []) as AdminUserRow[]} />;
}