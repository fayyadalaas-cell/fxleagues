import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";

  if (!code) {
    // لو ما في code نرجعه للصفحة الرئيسية
    return NextResponse.redirect(new URL("/", url.origin));
  }

  const supabase = await createClient();

  // يبدّل code إلى session cookies (Server-side)
  await supabase.auth.exchangeCodeForSession(code);

  // رجع المستخدم للمكان المطلوب
  return NextResponse.redirect(new URL(next, url.origin));
}