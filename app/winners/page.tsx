"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

const START_BALANCE = 10000;

type NumericLike = number | string | null;

type TournamentRow = {
  id: string;
  title: string;
  end_date: string | null;

  // ✅ prizes
  prize_pool?: NumericLike;
  prize_1?: NumericLike;
  prize_2?: NumericLike;
  prize_3?: NumericLike;
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

type ResultRow = {
  tournament_id: string;
  user_id: string;
  rank: number;
  pnl: NumericLike;
  user?: ProfileRow | null;
};

function toNum(v: NumericLike): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function money(v: NumericLike) {
  const n = toNum(v);
  if (n === null) return "—";
  return n.toLocaleString("en-US");
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

function roiFromPnl(pnl: NumericLike) {
  const n = toNum(pnl) ?? 0;
  return (n / START_BALANCE) * 100;
}

function displayName(r: ResultRow) {
  const u = r.user;
  const name =
    u?.full_name ||
    u?.username ||
    u?.email ||
    (r.user_id ? `User-${r.user_id.slice(0, 6)}` : "—");
  return name;
}

function prizeForRank(t: TournamentRow | null, rank: number): NumericLike {
  if (!t) return null;
  if (rank === 1) return t.prize_1 ?? null;
  if (rank === 2) return t.prize_2 ?? null;
  if (rank === 3) return t.prize_3 ?? null;
  return null;
}

async function attachProfilesToResults(rows: ResultRow[]) {
  const ids = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean)));
  if (ids.length === 0) return rows;

  const { data: pData, error: pErr } = await supabase
    .from("profiles")
    .select("id, email, full_name, username, avatar_url")
    .in("id", ids);

  if (pErr) {
    console.error("profiles fetch error:", pErr);
    return rows;
  }

  const map = new Map<string, ProfileRow>();
  (pData ?? []).forEach((p: any) => map.set(p.id, p));

  return rows.map((r) => ({ ...r, user: map.get(r.user_id) ?? null }));
}

export default function WinnersPage() {
  const [topTournaments, setTopTournaments] = useState<TournamentRow[]>([]);
  const [topResults, setTopResults] = useState<Record<string, ResultRow[]>>({});
  const [loadingTop, setLoadingTop] = useState(true);

  const [allTournaments, setAllTournaments] = useState<TournamentRow[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [selectedResults, setSelectedResults] = useState<ResultRow[]>([]);
  const [loadingSelected, setLoadingSelected] = useState(false);

  // 1) آخر 3 مسابقات CLOSED + Top3 لكل واحدة
  useEffect(() => {
    async function run() {
      setLoadingTop(true);

      const { data: tData, error: tErr } = await supabase
        .from("tournaments")
        .select("id, title, end_date, prize_pool, prize_1, prize_2, prize_3")
        .eq("status", "CLOSED")
        .order("end_date", { ascending: false })
        .limit(3);

      if (tErr) console.error("tournaments top error:", tErr);

      const tournaments = (tData ?? []) as TournamentRow[];
      setTopTournaments(tournaments);

      if (tournaments.length) {
        const ids = tournaments.map((t) => t.id);

        const { data: rData, error: rErr } = await supabase
          .from("tournament_results")
          .select("tournament_id, user_id, rank, pnl")
          .in("tournament_id", ids)
          .lte("rank", 3)
          .order("tournament_id", { ascending: false })
          .order("rank", { ascending: true });

        if (rErr) console.error("results top error:", rErr);

        const rawRows = (rData ?? []) as ResultRow[];
        const rowsWithProfiles = await attachProfilesToResults(rawRows);

        const grouped: Record<string, ResultRow[]> = {};
        rowsWithProfiles.forEach((rr) => {
          grouped[rr.tournament_id] = grouped[rr.tournament_id] ?? [];
          grouped[rr.tournament_id].push(rr);
        });

        setTopResults(grouped);
      } else {
        setTopResults({});
      }

      setLoadingTop(false);
    }

    run();
  }, []);

  // 2) قائمة الأرشيف (CLOSED)
  useEffect(() => {
    async function fetchArchive() {
      const { data, error } = await supabase
        .from("tournaments")
        .select("id, title, end_date, prize_pool, prize_1, prize_2, prize_3")
        .eq("status", "CLOSED")
        .order("end_date", { ascending: false })
        .limit(50);

      if (error) console.error("archive tournaments error:", error);

      const rows = (data ?? []) as TournamentRow[];
      setAllTournaments(rows);

      if (!selectedTournamentId && rows.length) {
        setSelectedTournamentId(rows[0].id);
      }
    }

    fetchArchive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3) عند تغيير التورنمنت المختار => هات كل النتائج ورتّبها
  useEffect(() => {
    async function fetchSelected() {
      if (!selectedTournamentId) return;

      setLoadingSelected(true);

      const { data, error } = await supabase
        .from("tournament_results")
        .select("tournament_id, user_id, rank, pnl")
        .eq("tournament_id", selectedTournamentId)
        .order("rank", { ascending: true });

      if (error) console.error("selected results error:", error);

      const rawRows = (data ?? []) as ResultRow[];
      const rowsWithProfiles = await attachProfilesToResults(rawRows);

      setSelectedResults(rowsWithProfiles);
      setLoadingSelected(false);
    }

    fetchSelected();
  }, [selectedTournamentId]);

  const selectedTournament = useMemo(() => {
    return allTournaments.find((t) => t.id === selectedTournamentId) ?? null;
  }, [allTournaments, selectedTournamentId]);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Winners <span className="text-yellow-400">Archive</span>
            </h1>
            <p className="text-zinc-400 mt-3 max-w-2xl">
              Top 3 winners per tournament. ROI is calculated based on a{" "}
              {START_BALANCE.toLocaleString("en-US")}$ starting balance.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/schedule"
              className="border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-900 text-sm"
            >
              View schedule
            </Link>
            <Link
              href="/"
              className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 text-sm"
            >
              Back to home
            </Link>
          </div>
        </div>

        {/* ===== Top 3 for last 3 tournaments ===== */}
        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-400">Highlights</div>
              <div className="text-lg font-bold">Top 3 • Last 3 tournaments</div>
            </div>
            <div className="text-xs text-zinc-500">Showing ranks 1–3</div>
          </div>

          {loadingTop ? (
            <div className="p-6 text-sm text-zinc-400">Loading winners…</div>
          ) : topTournaments.length === 0 ? (
            <div className="p-6 text-sm text-zinc-400">
              No closed tournaments yet.
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              {topTournaments.map((t) => {
                const rows = topResults[t.id] ?? [];
                return (
                  <div
                    key={t.id}
                    className="rounded-2xl border border-zinc-800 bg-black/20 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs text-zinc-500">{fmtDate(t.end_date)}</div>
                        <div className="text-lg font-semibold mt-1">{t.title}</div>

                        <div className="mt-2 inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border border-zinc-800 bg-black/25 text-zinc-300">
                          <span className="text-zinc-400">Prize Pool</span>
                          <span className="font-semibold text-yellow-300">
                            {t.prize_pool != null ? `$${money(t.prize_pool)}` : "—"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedTournamentId(t.id)}
                        className="text-xs px-3 py-1 rounded-full border border-zinc-700 hover:bg-zinc-900"
                      >
                        View →
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {[1, 2, 3].map((rk) => {
                        const r = rows.find((x) => x.rank === rk);
                        const pnl = r?.pnl ?? null;
                        const roi = roiFromPnl(pnl);
                        const medal = rk === 1 ? "🥇" : rk === 2 ? "🥈" : "🥉";
                        const prizeWon = prizeForRank(t, rk);

                        return (
                          <div
                            key={rk}
                            className="rounded-xl border border-zinc-800 bg-black/25 p-4 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-lg">{medal}</div>
                              <div>
                                <div className="text-xs text-zinc-400">Rank #{rk}</div>
                                <div className="font-semibold">{r ? displayName(r) : "—"}</div>
                                <div className="text-xs text-zinc-400 mt-1">
                                  Prize Won:{" "}
                                  <span className="text-yellow-300 font-semibold">
                                    {prizeWon != null ? `$${money(prizeWon)}` : "—"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-xs text-zinc-400">Profit</div>
                              <div className="font-bold text-green-400">
                                {pnl != null ? `+$${money(pnl)}` : "—"}
                              </div>
                              <div className="text-xs text-emerald-300 mt-1">
                                {pnl != null ? `+${roi.toFixed(2)}% ROI` : "—"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== Archive selector ===== */}
        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-400">Archive</div>
              <div className="text-lg font-bold">Pick a tournament to view winners</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-zinc-500">Tournament:</div>
              <select
                value={selectedTournamentId}
                onChange={(e) => setSelectedTournamentId(e.target.value)}
                className="bg-black/40 border border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none"
              >
                {allTournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} • {fmtDate(t.end_date)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-6">
            {loadingSelected ? (
              <div className="text-sm text-zinc-400">Loading results…</div>
            ) : !selectedTournament ? (
              <div className="text-sm text-zinc-400">No tournament selected.</div>
            ) : selectedResults.length === 0 ? (
              <div className="text-sm text-zinc-400">
                No winners published for this tournament yet.
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800 bg-black/20 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="text-xs text-zinc-400">Selected tournament</div>
                    <div className="font-semibold">{selectedTournament.title}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Prize Pool:{" "}
                      <span className="text-yellow-300 font-semibold">
                        {selectedTournament.prize_pool != null
                          ? `$${money(selectedTournament.prize_pool)}`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500">
                    {fmtDate(selectedTournament.end_date)}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-black/30">
                      <tr className="text-left text-zinc-400">
                        <th className="px-5 py-3">Rank</th>
                        <th className="px-5 py-3">Trader</th>
                        <th className="px-5 py-3">Prize Won</th>
                        <th className="px-5 py-3">Profit</th>
                        <th className="px-5 py-3">ROI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {selectedResults.map((r) => {
                        const pnlNum = toNum(r.pnl) ?? 0;
                        const roi = roiFromPnl(r.pnl);
                        const highlight =
                          r.rank === 1
                            ? "bg-yellow-500/10"
                            : r.rank === 2
                            ? "bg-white/5"
                            : r.rank === 3
                            ? "bg-emerald-500/5"
                            : "";

                        const pw = prizeForRank(selectedTournament, r.rank);

                        return (
                          <tr key={`${r.user_id}-${r.rank}`} className={highlight}>
                            <td className="px-5 py-4 font-bold">#{r.rank}</td>
                            <td className="px-5 py-4 font-semibold text-zinc-200">
                              {displayName(r)}
                            </td>
                            <td className="px-5 py-4 font-bold text-yellow-300">
                              {pw != null ? `$${money(pw)}` : "—"}
                            </td>
                            <td className="px-5 py-4 font-bold text-green-400">
                              +${money(pnlNum)}
                            </td>
                            <td className="px-5 py-4 font-bold text-emerald-300">
                              +{roi.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="px-5 py-4 border-t border-zinc-800 text-xs text-zinc-500">
                  ROI is calculated from starting balance ${START_BALANCE.toLocaleString("en-US")}:
                  ROI = (Profit ÷ {START_BALANCE}) × 100
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}