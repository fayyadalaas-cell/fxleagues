import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "alaa_fayyad@hotmail.com";

export async function GET(req: Request) {
  try {
    // 1) لازم يكون فيه Bearer token من المستخدم (جلسة تسجيل الدخول)
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

    if (!token) {
      return NextResponse.json({ ok: false, message: "Missing token" }, { status: 401 });
    }

    // 2) نتحقق من هوية المستخدم (بالـ anon key)
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userData?.user?.email) {
      return NextResponse.json({ ok: false, message: "Invalid session" }, { status: 401 });
    }

    if (userData.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    // 3) بعد ما تأكدنا إنه الأدمن، نقرأ من DB باستخدام service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id,email,status,source,created_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      return NextResponse.json({ ok: false, message: "DB error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, rows: data || [] });
  } catch {
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}