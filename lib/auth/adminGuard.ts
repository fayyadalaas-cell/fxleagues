import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin";

export async function requireAdmin() {
  noStore();

  // ✅ 1) نجيب المستخدم من session (cookies)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/signin?next=/admin");

  // ✅ 2) نفحص صلاحية الأدمن من DB باستخدام service role (بدون مشاكل RLS)
  const admin = createAdminClient();

  const { data: row, error } = await admin
    .from("admin_users")
    .select("user_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) redirect("/not-authorized?reason=admin_query_error");
  if (!row) redirect("/not-authorized?reason=not_admin");

  return { user, role: row.role };
}