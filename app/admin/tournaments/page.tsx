import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Tournament = {
  id: string;
  title: string | null;
  slug: string | null;
  start_date: string | null;
  prize_pool: number | null;
  status: string | null;
  type: string | null;
};

export default async function AdminTournamentsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tournaments")
    .select("id,title,slug,start_date,prize_pool,status,type")
    .order("start_date", { ascending: true });

  const items = (data ?? []) as Tournament[];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Link href="/admin" className="text-yellow-400 hover:underline text-sm">
              ← Back to Admin
            </Link>
            <h1 className="text-3xl font-bold mt-3">Tournaments</h1>
            <p className="mt-2 text-zinc-400">Manage schedule tournaments.</p>
          </div>

          <Link
            href="/admin/tournaments/new"
            className="rounded-lg bg-yellow-500 text-black px-4 py-2 font-semibold hover:bg-yellow-400 transition"
          >
            + New Tournament
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-200">
            Error loading tournaments: {error.message}
          </div>
        )}

        {!error && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="grid grid-cols-12 border-b border-zinc-800 px-4 py-3 text-xs text-zinc-400">
              <div className="col-span-4">Tournament</div>
              <div className="col-span-3">Start</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2 text-right">Prize</div>
              <div className="col-span-1 text-right">Open</div>
            </div>

            <div className="divide-y divide-zinc-800">
              {items.map((t) => (
                <div key={t.id} className="grid grid-cols-12 items-center px-4 py-4">
                  <div className="col-span-4">
                    <div className="font-semibold">{t.title ?? "—"}</div>
                    <div className="text-xs text-zinc-400">{t.slug ?? t.id}</div>
                  </div>

                  <div className="col-span-3 text-sm text-zinc-200">
                    {t.start_date ? new Date(t.start_date).toLocaleString() : "—"}
                  </div>

                  <div className="col-span-2">
                    <span className="rounded-full border border-zinc-700/70 px-2 py-1 text-xs text-zinc-200">
                      {t.type ?? "—"}
                    </span>
                    {t.status && (
                      <span className="ml-2 rounded-full border border-zinc-700/70 px-2 py-1 text-xs text-zinc-400">
                        {t.status}
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 text-right font-semibold">
                    ${Number(t.prize_pool ?? 0).toLocaleString()}
                  </div>

                  <div className="col-span-1 text-right">
                    <Link
                      className="text-yellow-400 hover:underline text-sm"
                      href={`/admin/tournaments/${t.id}/edit`}
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="px-4 py-6 text-sm text-zinc-400">No tournaments found.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}