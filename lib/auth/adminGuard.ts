import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "../supabase/server";

export async function requireAdmin() {
  noStore();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // لو مش مسجل دخول
  if (!user) redirect("/signin?next=/admin");

  // تحقق إنه موجود بجدول admins
  const { data: row, error } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // لو RLS مانع القراءة أو مش Admin
  if (error || !row) redirect("/");

  return { user };
}