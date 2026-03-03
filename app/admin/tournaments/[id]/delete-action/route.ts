import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/adminGuard";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await createClient();
  await requireAdmin();

  const form = await req.formData();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "").toUpperCase();

  if (!id) {
    return NextResponse.redirect(new URL("/admin/tournaments", req.url), 303);
  }

  if (status === "LIVE") {
    const url = new URL(`/admin/tournaments/${id}/delete`, req.url);
    url.searchParams.set("err", encodeURIComponent("Tournament is LIVE. Set it to COMPLETED first."));
    return NextResponse.redirect(url, 303);
  }

  const { error } = await supabase.from("tournaments").delete().eq("id", id);

  if (error) {
    const url = new URL(`/admin/tournaments/${id}/delete`, req.url);
    url.searchParams.set(
      "err",
      encodeURIComponent(`${error.code ?? ""} ${error.message ?? "Delete failed"}`.trim())
    );
    return NextResponse.redirect(url, 303);
  }

  return NextResponse.redirect(new URL("/admin/tournaments", req.url), 303);
}