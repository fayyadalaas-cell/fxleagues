import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function cleanEmail(input: string) {
  return String(input || "")
    .replace(/[\s\u00A0\u200B\u200C\u200D]/g, "")
    .trim()
    .toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = cleanEmail(body?.email);
    const source = String(body?.source || "footer").trim();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, message: "Invalid email" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1) Check if already exists
    const { data: existing, error: selectErr } = await supabase
      .from("newsletter_subscribers")
      .select("email,status")
      .eq("email", email)
      .maybeSingle();

    if (selectErr) {
      return NextResponse.json({ ok: false, message: "Could not subscribe" }, { status: 500 });
    }

    // If exists and active -> already subscribed
    if (existing?.email && existing?.status === "active") {
      return NextResponse.json({ ok: true, already: true, message: "Already subscribed" });
    }

    // 2) If exists but not active, reactivate (or if not exists, insert)
    // Use upsert to handle both cases safely
    const { error: upsertErr } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, status: "active", source }, { onConflict: "email" });

    if (upsertErr) {
      return NextResponse.json({ ok: false, message: "Could not subscribe" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, already: false, message: "Subscribed" });
  } catch {
    return NextResponse.json({ ok: false, message: "Bad request" }, { status: 400 });
  }
}