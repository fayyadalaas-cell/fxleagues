import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const source = String(body?.source || "footer").trim();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, message: "Invalid email" }, { status: 400 });
    }

    // مهم: استخدم Service Role في السيرفر فقط
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Upsert: لو نفس الإيميل موجود، نعتبره "already subscribed" أو نرجعه active
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email, status: "active", source },
        { onConflict: "email" }
      );

    if (error) {
      return NextResponse.json({ ok: false, message: "Could not subscribe" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Subscribed" });
  } catch {
    return NextResponse.json({ ok: false, message: "Bad request" }, { status: 400 });
  }
}