import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function cleanEmail(input: string) {
  return String(input || "")
    .replace(/[\s\u00A0\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[.,;:]+$/g, "");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ extract a valid email even if the string contains weird characters around it
function extractEmail(raw: string) {
  const match = String(raw || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const rawEmail = String(body?.email ?? "");
    const source = String(body?.source || "footer").trim();

    // 1) clean first
    let email = cleanEmail(rawEmail);

    // 2) if still invalid, try extracting an email from raw string
    if (!isValidEmail(email)) {
      const extracted = extractEmail(rawEmail);
      email = cleanEmail(extracted);
    }

    // 3) final validation
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, message: "Invalid email" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check existing
    const { data: existing, error: selErr } = await supabase
      .from("newsletter_subscribers")
      .select("email,status")
      .eq("email", email)
      .maybeSingle();

    if (selErr) {
      return NextResponse.json({ ok: false, message: "Could not subscribe" }, { status: 500 });
    }

    if (existing?.email && existing?.status === "active") {
      return NextResponse.json({ ok: true, already: true, message: "Already subscribed" });
    }

    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, status: "active", source }, { onConflict: "email" });

    if (error) {
      return NextResponse.json({ ok: false, message: "Could not subscribe" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, already: false, message: "Subscribed" });
  } catch {
    // مهم: لا نرجع 400 هنا بطريقة تخليك تفكر أنه "Invalid email"
    return NextResponse.json({ ok: false, message: "Bad request" }, { status: 400 });
  }
}