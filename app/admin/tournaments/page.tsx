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

function fmtDate(ts: string | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString();
}

function StatusPill({ status }: { status: string | null }) {
  const s = (status ?? "").toUpperCase();
  const base =
    "inline-flex items-center rounded-full border px-2 py-1 text-[11px] leading-none";
  if (!s) return <span className={`${base} border-zinc-700/70 text-zinc-400`}>—</span>;

  if (s === "LIVE")
    return <span className={`${base} border-emerald-700/40 text-emerald-300`}>LIVE</span>;
  if (s === "UPCOMING")
    return <span className={`${base} border-sky-700/40 text-sky-300`}>UPCOMING</span>;
  if (s === "COMPLETED" || s === "CLOSED" || s === "ENDED")
    return <span className={`${base} border-zinc-700/70 text-zinc-300`}>CLOSED</span>;

  return <span className={`${base} border-zinc-700/70 text-zinc-300`}>{s}</span>;
}

function TypePill({ type }: { type: string | null }) {
  const t = type ?? "";
  const base =
    "inline-flex items-center rounded-full border border-zinc-700/70 px-2 py-1 text-[11px] leading-none text-zinc-200";
  return <span className={base}>{t || "—"}</span>;
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
            <p className="mt-2 text-zinc-400">
              Click any tournament to manage (edit, registrations, results, prizes).
            </p>
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
            {/* header */}
            <div className="grid grid-cols-12 border-b border-zinc-800 px-4 py-3 text-xs text-zinc-400">
              <div className="col-span-4">Tournament</div>
              <div className="col-span-3">Start</div>
              <div className="col-span-3">Type / Status</div>
              <div className="col-span-1 text-right">Pool</div>
              <div className="col-span-1 text-right">Open</div>
            </div>

            <div className="divide-y divide-zinc-800">
              {items.map((t) => (
                <Link
                  key={t.id}
                  href={`/admin/tournaments/${t.id}`}
                  className="grid grid-cols-12 items-center px-4 py-3 hover:bg-white/[0.03] transition"
                  title="Open tournament"
                >
                  {/* Tournament */}
                  <div className="col-span-4 min-w-0">
                    <div className="font-semibold truncate">{t.title ?? "—"}</div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {t.slug ?? t.id}
                    </div>
                  </div>

                  {/* Start */}
                  <div className="col-span-3 text-[13px] text-zinc-200">
                    {fmtDate(t.start_date)}
                  </div>

                  {/* Type / Status */}
                  <div className="col-span-3 flex items-center gap-2">
                    <TypePill type={t.type} />
                    <StatusPill status={t.status} />
                    {t.winners_count ? (
                      <span className="ml-1 text-[11px] text-zinc-500">
                        Winners: {t.winners_count}
                      </span>
                    ) : null}
                  </div>

                  {/* Prize pool */}
                  <div className="col-span-1 text-right text-[13px] font-semibold">
                    {money(Number(t.prize_pool ?? 0))}
                  </div>

                  {/* Open chevron */}
                  <div className="col-span-1 text-right text-zinc-400">
                    <span className="inline-flex items-center justify-end gap-1 text-[12px] hover:text-zinc-200">
                      Open <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
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