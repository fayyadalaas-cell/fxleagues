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

    // Insert / Reactivate
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, status: "active", source }, { onConflict: "email" });

    if (error) {
      return NextResponse.json({ ok: false, message: "Could not subscribe" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, already: false, message: "Subscribed" });
  } catch {
    return NextResponse.json({ ok: false, message: "Bad request" }, { status: 400 });
  }
}