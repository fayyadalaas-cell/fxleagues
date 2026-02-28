import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/adminGuard";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // ✅ ensure admin (server)
    await requireAdmin();

    const body = await req.json().catch(() => ({}));
    const user_id = String(body?.user_id ?? "");
    const is_banned = Boolean(body?.is_banned);

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { error } = await admin
      .from("profiles")
      .update({ is_banned })
      .eq("id", user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Access denied" },
      { status: 403 }
    );
  }
}