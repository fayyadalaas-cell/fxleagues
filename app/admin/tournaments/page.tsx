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
  winners_count: number | null;
  prize_1: number | null;
  prize_2: number | null;
  prize_3: number | null;
};

function money(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function PrizeTop3({ t }: { t: Tournament }) {
  const p1 = Number(t.prize_1 ?? 0);
  const p2 = Number(t.prize_2 ?? 0);
  const p3 = Number(t.prize_3 ?? 0);

  if (!p1 && !p2 && !p3) return <span className="text-zinc-500">—</span>;

  return (
    <div className="inline-flex flex-col items-end gap-1 text-xs text-zinc-200">
      {p1 ? <div className="leading-tight">#1 {money(p1)}</div> : null}
      {p2 ? <div className="leading-tight">#2 {money(p2)}</div> : null}
      {p3 ? <div className="leading-tight">#3 {money(p3)}</div> : null}
    </div>
  );
}

export default async function AdminTournamentsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tournaments")
    .select("id,title,slug,start_date,prize_pool,status,type,winners_count,prize_1,prize_2,prize_3")
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
              <div className="col-span-3">Tournament</div>
              <div className="col-span-2">Start</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2 text-right">Prize Pool</div>
              <div className="col-span-2 text-right">Prize (Top 3)</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            <div className="divide-y divide-zinc-800">
              {items.map((t) => (
                <div key={t.id} className="grid grid-cols-12 items-center px-4 py-4">
                  <div className="col-span-3 min-w-0">
                    <div className="font-semibold truncate">{t.title ?? "—"}</div>
                    <div className="text-xs text-zinc-400 truncate">{t.slug ?? t.id}</div>
                  </div>

                  <div className="col-span-2 text-sm text-zinc-200">
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
                    {money(Number(t.prize_pool ?? 0))}
                  </div>

                  <div className="col-span-2 text-right">
                    <PrizeTop3 t={t} />
                    {t.winners_count ? (
                      <div className="mt-2 text-[11px] text-zinc-500">Winners: {t.winners_count}</div>
                    ) : null}
                  </div>

                  <div className="col-span-1 text-right">
                    <div className="flex flex-col items-end gap-2">
                      <Link
                        href={`/admin/tournaments/${t.id}/edit`}
                        className="rounded-md border border-zinc-700/70 px-2 py-1 text-xs text-yellow-300 hover:bg-zinc-900"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/tournaments/${t.id}/registrations`}
                        className="rounded-md border border-zinc-700/70 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-900"
                      >
                        Reg
                      </Link>
                      <Link
                        href={`/admin/tournaments/${t.id}/results`}
                        className="rounded-md border border-zinc-700/70 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-900"
                      >
                        Res
                      </Link>
                    </div>
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