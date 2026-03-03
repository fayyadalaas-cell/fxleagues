import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/adminGuard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Row = {
  id: string;
  title: string | null;
  status: string | null;
};

export default async function DeleteTournamentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: { err?: string };
}) {
  const { id } = await params;
  const supabase = await createClient();
  await requireAdmin();

  if (!id) redirect("/admin/tournaments");

  const { data, error } = await supabase
    .from("tournaments")
    .select("id,title,status")
    .eq("id", id)
    .single<Row>();

  if (error || !data) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <div className="rounded-2xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-200">
            Failed to load tournament: {error?.message ?? "Not found"}
          </div>
          <div className="mt-6">
            <Link href="/admin/tournaments" className="text-yellow-400 hover:underline">
              ← Back to Tournaments
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isLive = (data.status ?? "").toUpperCase() === "LIVE";
  const errMsg =
    typeof searchParams?.err === "string" && searchParams.err.length
      ? decodeURIComponent(searchParams.err)
      : "";

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/admin/tournaments" className="text-yellow-400 hover:underline text-sm">
          ← Back to Tournaments
        </Link>

        <h1 className="text-3xl font-bold mt-4">Delete Tournament</h1>
        <p className="mt-2 text-zinc-400">
          You are about to delete:{" "}
          <span className="text-white font-semibold">{data.title ?? "Untitled"}</span>
        </p>

        {errMsg ? (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            Delete failed: {errMsg}
          </div>
        ) : null}

        {isLive && (
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            This tournament is LIVE. Set it to COMPLETED before deleting.
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          This action cannot be undone.
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/admin/tournaments"
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-200 hover:bg-zinc-800"
          >
            Cancel
          </Link>

          {/* ✅ POST لنفس المسار /delete — route.ts راح يمسكه */}
          <form action={`/admin/tournaments/${data.id}/delete-action`} method="post">
            <input type="hidden" name="id" value={data.id} />
            <input type="hidden" name="status" value={data.status ?? ""} />

            <button
              type="submit"
              disabled={isLive}
              className="rounded-xl border border-red-500/30 bg-red-500/20 px-4 py-2 text-red-100 hover:bg-red-500/30 disabled:opacity-50"
            >
              Confirm Delete
            </button>
          </form>
        </div>

        <div className="mt-6 text-xs text-zinc-500">
          Tournament ID: <span className="text-zinc-300">{data.id}</span>
        </div>
      </div>
    </main>
  );
}