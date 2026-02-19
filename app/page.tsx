"use client";
import { useEffect, useState } from "react";

import Link from "next/link";
import Image from "next/image";
import Next7DaysFromDb from "@/app/components/home/Next7DaysFromDb";
import { supabase } from "@/lib/supabase";

type Tournament = {
  id: string;
  dateLabel: string;
  time: string;
  title: string;
  type: "Daily" | "Weekly" | "Monthly" | "Special";
  duration: string;
status: "UPCOMING" | "LIVE" | "COMPLETED";
  prize: number;
  sponsor: { name: string; logo?: string };
};

type LeaderRow = {
  rank: number;
  trader: string;
  roi: number;
  profit: number;
  maxDD: number;
  trades: number;
};

const upcomingCards: Tournament[] = [
  {
    id: "daily-sprint",
    dateLabel: "Feb 17",
    time: "7:00 PM",
    title: "Daily Sprint",
    type: "Daily",
    duration: "3 Hours",
    status: "UPCOMING",
    prize: 1000,
    sponsor: { name: "Exness", logo: "/brokers/exness.png" },
  },
  {
    id: "friday-knockout",
    dateLabel: "Feb 20",
    time: "8:00 PM",
    title: "Friday Knockout",
    type: "Weekly",
    duration: "2 Days",
    status: "UPCOMING",
    prize: 5000,
    sponsor: { name: "IC Markets", logo: "/brokers/icmarkets.png" },
  },
  {
    id: "monthly-grand-final",
    dateLabel: "Feb 28",
    time: "9:30 PM",
    title: "Monthly Grand Final",
    type: "Monthly",
    duration: "30 Days",
    status: "UPCOMING",
    prize: 50000,
    sponsor: { name: "FXTM", logo: "/brokers/fxtm.png" },
  },
];

// هذا الداتا القديمة للـ box يمين (لحد ما تربطها DB)
const next7Days: Tournament[] = [
  {
    id: "daily-sprint-0217",
    dateLabel: "Feb 17",
    time: "7:00 PM",
    title: "Daily Sprint",
    type: "Daily",
    duration: "3 Hours",
    status: "LIVE",
    prize: 1000,
    sponsor: { name: "Exness", logo: "/brokers/exness.png" },
  },
  {
    id: "friday-knockout-0220",
    dateLabel: "Feb 20",
    time: "8:00 PM",
    title: "Friday Knockout",
    type: "Weekly",
    duration: "2 Days",
    status: "UPCOMING",
    prize: 5000,
    sponsor: { name: "IC Markets", logo: "/brokers/icmarkets.png" },
  },
  {
    id: "sunday-major-0222",
    dateLabel: "Feb 22",
    time: "6:00 PM",
    title: "Sunday Major",
    type: "Weekly",
    duration: "1 Day",
    status: "UPCOMING",
    prize: 15000,
    sponsor: { name: "Vantage", logo: "/brokers/vantage.png" },
  },
];

const trustedBrokers = [
  { name: "Exness", logo: "/brokers/exness.png" },
  { name: "IC Markets", logo: "/brokers/icmarkets.png" },
  { name: "Vantage", logo: "/brokers/vantage.png" },
  { name: "FXTM", logo: "/brokers/fxtm.png" },
];

const leaderboardWeek: LeaderRow[] = [
  { rank: 1, trader: "Trader_Alpha", roi: 18.6, profit: 1240, maxDD: 4.2, trades: 38 },
  { rank: 2, trader: "MarketWolf", roi: 14.1, profit: 980, maxDD: 5.1, trades: 42 },
  { rank: 3, trader: "FX_King", roi: 10.9, profit: 710, maxDD: 6.3, trades: 33 },
  { rank: 4, trader: "PipSniper", roi: 8.1, profit: 540, maxDD: 7.0, trades: 29 },
  { rank: 5, trader: "LondonOpen", roi: 6.3, profit: 420, maxDD: 7.6, trades: 24 },
];

function money(n: number) {
  return n.toLocaleString("en-US");
}

function StatusBadge({ status }: { status: Tournament["status"] }) {
  const cls =
    status === "LIVE"
      ? "border border-green-700/60 bg-green-500/10 text-green-300"
      : "border border-yellow-700/60 bg-yellow-500/10 text-yellow-300";
  return (
    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${cls}`}>
      {status}
    </span>
  );
}

function TypePill({ type }: { type: Tournament["type"] }) {
  return (
    <span className="text-[11px] px-2 py-1 rounded-full border border-zinc-800 bg-black/30 text-zinc-200">
      {type}
    </span>
  );
}

function SponsorMini({ name, logo }: { name: string; logo?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-9 w-12 rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden flex items-center justify-center px-2">
        {logo ? (
          <Image
            src={logo}
            alt={name}
            width={120}
            height={40}
            className="object-contain max-h-6 w-auto"
          />
        ) : (
          <div className="h-3 w-3 rounded-full bg-zinc-600" />
        )}
      </div>
      <div className="text-sm font-semibold">{name}</div>
    </div>
  );
}

/** parse "Feb 20" + "8:00 PM" to Date قريب من اليوم */
function parseMonthDayTime(dateLabel: string, timeLabel: string) {
  const now = new Date();
  const year = now.getFullYear();

  const [monStr, dayStr] = dateLabel.split(" ");
  const day = Number(dayStr);

  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };

  const month = months[monStr] ?? now.getMonth();

  // time "8:00 PM"
  const m = timeLabel.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  let hh = 0;
  let mm = 0;
  let ap = "AM";
  if (m) {
    hh = Number(m[1]);
    mm = Number(m[2]);
    ap = m[3].toUpperCase();
  }
  if (ap === "PM" && hh !== 12) hh += 12;
  if (ap === "AM" && hh === 12) hh = 0;

  // جرب السنة الحالية، إذا طلع بالتاريخ الماضي كثير، خليه السنة الجاية
  const d1 = new Date(year, month, day, hh, mm, 0, 0);
  if (d1.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
    return new Date(year + 1, month, day, hh, mm, 0, 0);
  }
  return d1;
}

export default function HomePage() {
  const [nextTournament, setNextTournament] = useState<any>(null);
const [loadingNext, setLoadingNext] = useState(true);
useEffect(() => {
  async function fetchNextTournament() {
   const nowIso = new Date().toISOString();

const { data, error } = await supabase
  .from("tournaments")
  .select("*")
  // ✅ فقط القادمة (بعد الآن)
  .eq("status", "UPCOMING")
  .gte("start_date", nowIso)
  .order("start_date", { ascending: true })
  .limit(1)
  .maybeSingle();


if (!error && data) {
  setNextTournament(data);
}

setLoadingNext(false);
}

fetchNextTournament();
}, []);

const now = new Date();

// ✅ ما عاد نستخدم nearest القديم نهائيًا
const nearest: any = null;
const nearestStatus: "UPCOMING" | "LIVE" = "UPCOMING";
const liveId: string | undefined = undefined;


  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO (full width feel + cleaner spacing) */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="rounded-[28px] border border-zinc-900/80 bg-gradient-to-b from-zinc-950/70 to-black p-10 md:p-12 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
                Compete. Climb ranks.{" "}
                <span className="text-yellow-400">Win prizes.</span>
              </h1>

              <p className="text-zinc-300/90 mt-5 max-w-2xl">
                Forex trading competitions with verified rankings. Join events, submit your account
                details, and appear on the leaderboard.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/schedule"
                  className="bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition"
                >
                  View full schedule
                </Link>
                <a
                  href="#how"
                  className="border border-zinc-700 px-5 py-3 rounded-lg hover:bg-zinc-900 transition"
                >
                  How it works
                </a>
                <Link
                  href="/brokers"
                  className="border border-zinc-700 px-5 py-3 rounded-lg hover:bg-zinc-900 transition"
                >
                  Brokers
                </Link>
                <a
                  href="#leaderboard"
                  className="border border-zinc-700 px-5 py-3 rounded-lg hover:bg-zinc-900 transition"
                >
                  Leaderboard
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                <span className="text-[11px] px-2 py-1 rounded-full border border-zinc-800 bg-black/40 text-zinc-200">
                  Free entry (for now)
                </span>
                <span className="text-[11px] px-2 py-1 rounded-full border border-zinc-800 bg-black/40 text-zinc-200">
                  MT4 / MT5 ready
                </span>
                <span className="text-[11px] px-2 py-1 rounded-full border border-zinc-800 bg-black/40 text-zinc-200">
                  Verified rankings
                </span>
                <span className="text-[11px] px-2 py-1 rounded-full border border-zinc-800 bg-black/40 text-zinc-200">
                  Prizes & sponsors
                </span>
              </div>
            </div>

            {/* Right side: compact “today snapshot” */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
                <div className="text-xs text-zinc-400">Next tournament</div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="text-lg font-bold">
  {loadingNext ? "Loading..." : nextTournament?.title ?? "—"}
</div>

<StatusBadge
  status={
    nextTournament &&
    new Date(nextTournament.start_date) <= new Date() &&
    (!nextTournament.end_date ||
      new Date() <= new Date(nextTournament.end_date))
      ? "LIVE"
      : "UPCOMING"
  }
/>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                    <div className="text-xs text-zinc-400">Prize</div>
                    <div className="text-xl font-bold mt-1 text-yellow-300">
${money(nextTournament?.prize_pool ?? 0)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                    <div className="text-xs text-zinc-400">Starts</div>
                    <div className="text-sm font-semibold mt-2 text-zinc-200">
{nextTournament
  ? `${new Date(nextTournament.start_date).toLocaleDateString()} • ${new Date(nextTournament.start_date).toLocaleTimeString()}`
  : "—"}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">local time</div>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <Link
                    href={liveId ? `/tournaments/${liveId}` : "/schedule"}
                    className="flex-1 border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-900 text-sm text-center"
                  >
                    Details
                  </Link>
                  <Link
                    href={liveId ? `/tournaments/${liveId}/join` : "/schedule"}
                    className="flex-1 bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold text-sm text-center hover:bg-yellow-400 transition"
                  >
                    Join
                  </Link>
                </div>

                <div className="mt-4 text-xs text-zinc-500">
                  Flow: accept rules → download platform → submit account info.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BROKERS STRIP (FIX: no drop to 2nd line on desktop) */}
      <section className="max-w-6xl mx-auto px-6 pb-14">
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/50 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="text-sm font-semibold text-white">Trusted brokers</div>
              <div className="text-xs text-zinc-400 mt-1">
                Open a real or demo account — then join competitions faster.
              </div>
            </div>

            {/* ✅ تغيير صغير: grid بدل flex-wrap */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
              {trustedBrokers.map((b) => (
                <div
                  key={b.name}
                  className="h-14 rounded-2xl border border-zinc-800 bg-black/40 flex items-center justify-center px-5
                             transition hover:bg-zinc-900/40 hover:border-zinc-700 hover:scale-[1.02]"
                  title={b.name}
                >
                  <Image
                    src={b.logo}
                    alt={b.name}
                    width={160}
                    height={52}
                    className="object-contain max-h-9 w-auto"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING CARDS */}
      <section id="schedule" className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming tournaments</h2>
          <Link href="/schedule" className="text-sm text-yellow-400 hover:underline">
            See all
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingCards.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold">{t.title}</div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <StatusBadge status={t.status} />
                    <TypePill type={t.type} />
                    <span className="text-xs text-zinc-500">• {t.duration}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-400">Entry</div>
                  <div className="text-sm font-semibold">FREE</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                  <div className="text-xs text-zinc-400">Prize Pool</div>
                  <div className="text-xl font-bold mt-1">${money(t.prize)}</div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                  <div className="text-xs text-zinc-400">Partner</div>
                  <div className="mt-2">
                    <SponsorMini name={t.sponsor.name} logo={t.sponsor.logo} />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <Link
                  href={`/tournaments/${t.id}`}
                  className="flex-1 border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-900 text-sm text-center"
                >
                  Details
                </Link>
                <Link
                  href={`/tournaments/${t.id}/join`}
                  className="flex-1 bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold text-sm text-center hover:bg-yellow-400 transition"
                >
                  Join
                </Link>
              </div>

              <div className="mt-4 text-xs text-zinc-500">
                Flow: accept rules → download platform → submit account info.
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ بدل Next 7 Days: Upcoming tournaments from DB (closest 3) */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <Next7DaysFromDb title="Upcoming tournaments" limit={3} />
      </section>

      {/* LEADERBOARD (Improved) */}
      <section id="leaderboard" className="max-w-6xl mx-auto px-6 pb-16">
        {/* ... نفس كودك بدون أي تغيير ... */}
        {/* (أنا ما عدّلت شيء هنا) */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Leaderboard</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Top performance snapshot — updates as results come in.
            </p>
          </div>

          <Link href="/leaderboards" className="text-sm text-yellow-400 hover:underline">
            View full leaderboard →
          </Link>
        </div>

        {/* TOP 3 PODIUM */}
        <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="font-semibold">Top 3</div>
            <div className="text-xs text-zinc-500">Quick view (ROI + Profit)</div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaderboardWeek.slice(0, 3).map((r) => {
              const isFirst = r.rank === 1;
              const ring = isFirst
                ? "border-yellow-500/40 bg-yellow-500/10"
                : "border-zinc-800 bg-black/20";

              return (
                <div
                  key={r.rank}
                  className={`rounded-2xl border ${ring} p-5 relative overflow-hidden`}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-60" />

                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="text-xs text-zinc-400">Rank</div>
                      <div
                        className={`mt-1 text-3xl font-extrabold ${
                          isFirst ? "text-yellow-300" : "text-zinc-200"
                        }`}
                      >
                        #{r.rank}
                      </div>
                    </div>

                    <div
                      className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                        isFirst
                          ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-200"
                          : "border-zinc-700 bg-black/30 text-zinc-300"
                      }`}
                    >
                      {isFirst ? "LEADER" : "TOP"}
                    </div>
                  </div>

                  <div className="relative mt-4">
                    <div className="text-lg font-semibold">{r.trader}</div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-zinc-800 bg-black/25 p-4">
                        <div className="text-xs text-zinc-400">ROI</div>
                        <div className="mt-1 text-xl font-extrabold text-emerald-300">
                          +{r.roi}%
                        </div>
                      </div>
                      <div className="rounded-xl border border-zinc-800 bg-black/25 p-4">
                        <div className="text-xs text-zinc-400">Profit</div>
                        <div className="mt-1 text-xl font-extrabold text-green-400">
                          +${money(r.profit)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-6xl mx-auto px-6 pb-16">
        {/* ... نفس كودك بدون تغيير ... */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/15 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="text-xs text-zinc-400">How it works</div>
              <h2 className="text-2xl font-extrabold mt-2">
                Join in minutes — compete with clean rules
              </h2>
              <p className="text-zinc-400 mt-2 max-w-2xl">
                A simple flow designed for speed: agree to rules, download the platform,
                submit your trading account details, then you appear on the leaderboard.
              </p>
            </div>

            <Link
              href="/schedule"
              className="bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold w-fit hover:bg-yellow-400 transition"
            >
              See tournaments
            </Link>
          </div>
        </div>
      </section>

      {/* SPONSORS + CTA ... نفس كودك بدون تغيير */}
    </main>
  );
}
