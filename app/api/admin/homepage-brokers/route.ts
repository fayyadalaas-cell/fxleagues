import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/adminGuard";

export const dynamic = "force-dynamic";

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

type PatchBody = {
  key: string;
  name?: string;
  demo_url?: string | null;
  real_url?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  logo_path?: string | null;
};

const ALLOWED_KEYS = ["exness", "icmarkets", "vantage", "fxtm"] as const;
type AllowedKey = (typeof ALLOWED_KEYS)[number];

function isAllowedKey(k: string): k is AllowedKey {
  return (ALLOWED_KEYS as readonly string[]).includes(k);
}

// ✅ GET: رجّع كل بروكرز (للأدمن)
export async function GET() {
  await requireAdmin();

  const { data, error } = await supabaseAdmin
    .from("homepage_brokers")
    .select("key,name,logo_path,demo_url,real_url,sort_order,is_active,updated_at")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message, code: (error as any)?.code ?? null, hint: (error as any)?.hint ?? null },
      { status: 400 }
    );
  }

  return NextResponse.json({ data: data ?? [] });
}

// ✅ PATCH: تحديث صف واحد حسب key
export async function PATCH(req: Request) {
  await requireAdmin();

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  if (!isAllowedKey(body.key)) {
    return NextResponse.json({ error: "Invalid broker key" }, { status: 400 });
  }

  const update: Record<string, any> = {};

  if (typeof body.name === "string") update.name = body.name.trim();
  if (body.demo_url !== undefined) update.demo_url = body.demo_url;
  if (body.real_url !== undefined) update.real_url = body.real_url;
  if (body.sort_order !== undefined) update.sort_order = body.sort_order;
  if (body.is_active !== undefined) update.is_active = body.is_active;
  if (body.logo_path !== undefined) update.logo_path = body.logo_path;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  update.updated_at = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from("homepage_brokers")
    .update(update)
    .eq("key", body.key);

  if (error) {
    return NextResponse.json(
      { error: error.message, code: (error as any)?.code ?? null, hint: (error as any)?.hint ?? null },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}