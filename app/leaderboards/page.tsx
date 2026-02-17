"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Period = "today" | "week" | "month" | "all";
type Type = "All" | "Daily" | "Weekly" | "Monthly";

type Row = {
  rank: number;
  user: string;
  country: string;
  tournament: string;
  tournamentType: "Daily" | "Weekly" | "Monthly";
  pnl: number;       // USD
  winRate: number;   // %
  maxDD: number;     // %
  trades: number;
  updated: string;   // label
};

const demoRows: Row[] = [
  { rank: 1, user: "Trader_Alpha", country: "CA", tournament: "Daily Sprint", tournamentType: "Daily", pnl: 1240, winRate: 61, maxDD: 4.2, trades: 38, updated: "2m ago" },
  { rank: 2, user: "MarketWolf", country: "UK", tournament: "Friday Knockout", tournamentType: "Weekly", pnl: 980, winRate: 58, maxDD: 5.1, trades: 42, updated: "6m ago" },
  { rank: 3, user: "FX_King", country: "AE", tournament: "Sunday Major", tournamentType: "Weekly", pnl: 710, winRate: 55, maxDD: 6.3, trades: 33, updated: "12m ago" },
  { rank: 4, user: "PipSniper", country: "SA", tournament: "Daily Sprint", tournamentType: "Daily", pnl: 540, winRate: 52, maxDD: 7.0, trades: 29, updated: "18m ago" },
  { rank: 5, user: "LondonOpen", country: "DE", tournament: "Monthly Grand Final", tournamentType: "Monthly", pnl: 420, winRate: 50, maxDD: 7.6, trades: 24, updated: "25m ago" },
  { rank: 6, user: "RiskControl", country: "US", tournament: "Monthly Grand Final", tournamentType: "Monthly", pnl: 390, winRate: 49, maxDD: 6.9, trades: 19, updated: "32m ago" },
  { rank: 7, user: "TokyoTape", country: "JP", tournament: "Daily Sprint", tournamentType: "Daily", pnl: 310, winRate: 48, maxDD: 8.4, trades: 21, updated: "40m ago" },
  { rank: 8, user: "NoDD_NoCry", country: "EG", tournament: "Friday Knockout", tournamentType: "Weekly", pnl: 260, winRate: 46, maxDD: 4.9, trades: 17, updated: "49m ago" },
  { rank: 9, user: "SteadyHands", country: "FR", tournament: "Sunday Major", tournamentType: "Weekly", pnl: 220, winRate: 44, maxDD: 3.8, trades: 14, updated: "1h ago" },
  { rank: 10, user: "ChartChef", country: "QA", tournament: "Monthly Grand Final", tournamentType: "Monthly", pnl: 180, winRate: 42, maxDD: 9.2, trades: 16, updated: "1h ago" },
];

function formatMoney(n: number) {
  const sign = n >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(n).toLocaleString("en-US")}`;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] px-2 py-1 rounded-full border border-zinc-800 bg-black/30 text-zinc-200">
      {children}
    </span>
  );
}

function PeriodButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
          : "px-4 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-300"
      }
    >
      {label}
    </button>
  );
}

export default function LeaderboardsPage() {
  const [period, setPeriod] = useState<Period>("week");
  const [type, setType] = useState<Type>("All");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    // Demo: period filter is UI-only for now (later we’ll fetch real data per period)
    let filtered = [...demoRows];

    if (type !== "All") {
      filtered = filtered.filter((r) => r.tournamentType === type);
    }

    if (q.trim()) {
      const s = q.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.user.toLowerCase().includes(s) ||
          r.tournament.toLowerCase().includes(s) ||
          r.country.toLowerCase().includes(s)
      );
    }

    return filtered;
  }, [type, q, period]);

  const top3 = rows.slice(0, 3);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link href="/" className="text-yellow-400 hover:underline text-sm">
              ← Back to Home
            </Link>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold">
              Leaderboards
            </h1>
            <p className="mt-3 text-zinc-400 max-w-2xl">
              Track top traders across tournaments. Use filters to explore results.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/schedule"
              className="border border-zinc-700 px-5 py-3 rounded-lg hover:bg-zinc-900"
            >
              View schedule
            </Link>
            <Link
              href="/brokers"
              className="bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold"
            >
              Brokers
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <PeriodButton active={period === "today"} label="Today" onClick={() => setPeriod("today")} />
              <PeriodButton active={period === "week"} label="This Week" onClick={() => setPeriod("week")} />
              <PeriodButton active={period === "month"} label="This Month" onClick={() => setPeriod("month")} />
              <PeriodButton active={period === "all"} label="All Time" onClick={() => setPeriod("all")} />
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Type)}
                className="w-full md:w-[200px] bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
              >
                <option value="All">All Types</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search trader / tournament / country..."
                className="w-full md:w-[320px] bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-zinc-300">
            <Pill>Live demo data</Pill>
            <Pill>Sorting: by rank</Pill>
            <Pill>Next: real data from DB</Pill>
          </div>
        </div>

        {/* Top 3 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {top3.map((p) => (
            <div
              key={p.user}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-zinc-400">Rank</div>
                  <div className="text-3xl font-extrabold mt-1">#{p.rank}</div>
                </div>

                <span className="text-[11px] px-2 py-1 rounded-full border border-zinc-800 bg-black/30 text-zinc-200">
                  {p.tournamentType}
                </span>
              </div>

              <div className="mt-5">
                <Link
                  href={`/profile/${p.user}`}
                  className="text-xl font-semibold hover:underline"
                >
                  {p.user}
                </Link>
                <div className="text-sm text-zinc-400 mt-1">
                  {p.country} • {p.tournament} • Updated {p.updated}
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div className="text-zinc-400 text-sm">PnL</div>
                  <div className="text-2xl font-bold text-green-400">
                    {formatMoney(p.pnl)}
                  </div>
                </div>

                <div className="mt-3 text-sm text-zinc-400">
                  Win Rate: <span className="text-white font-semibold">{p.winRate}%</span> • Max DD:{" "}
                  <span className="text-white font-semibold">{p.maxDD}%</span> • Trades:{" "}
                  <span className="text-white font-semibold">{p.trades}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/15 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Full standings</h2>
            <div className="text-sm text-zinc-400">
              Showing <span className="text-white font-semibold">{rows.length}</span> traders
            </div>
          </div>

          <div className="px-6 py-3 text-xs text-zinc-400 grid grid-cols-12">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">Trader</div>
            <div className="col-span-3">Tournament</div>
            <div className="col-span-2 text-right">PnL</div>
            <div className="col-span-1 text-right">Win%</div>
            <div className="col-span-1 text-right">Max DD</div>
            <div className="col-span-1 text-right">Trades</div>
          </div>

          {rows.map((r) => (
            <div
              key={r.user}
              className="px-6 py-4 border-t border-zinc-900/70 grid grid-cols-12 items-center hover:bg-black/25"
            >
              <div className="col-span-1 font-semibold">#{r.rank}</div>

              <div className="col-span-3">
                <Link
                  href={`/profile/${r.user}`}
                  className="font-semibold hover:underline"
                >
                  {r.user}
                </Link>
                <div className="text-xs text-zinc-500 mt-1">
                  {r.country} • Updated {r.updated}
                </div>
              </div>

              <div className="col-span-3">
                <div className="font-semibold">{r.tournament}</div>
                <div className="text-xs text-zinc-500 mt-1">{r.tournamentType}</div>
              </div>

              <div className="col-span-2 text-right font-semibold text-green-400">
                {formatMoney(r.pnl)}
              </div>

              <div className="col-span-1 text-right">{r.winRate}%</div>
              <div className="col-span-1 text-right">{r.maxDD}%</div>
              <div className="col-span-1 text-right">{r.trades}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/40 to-black p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="text-xs text-zinc-400">Next step</div>
            <div className="text-2xl font-extrabold mt-2">
              Join a tournament and appear on the leaderboard
            </div>
            <div className="text-sm text-zinc-400 mt-2">
              Pick an event from the schedule and complete the join flow.
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/schedule"
              className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold"
            >
              View schedule
            </Link>
            <Link
              href="/how-it-works"
              className="border border-zinc-700 px-6 py-3 rounded-lg hover:bg-zinc-900"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
