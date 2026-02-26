"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import Next7DaysFromDb from "@/app/components/home/Next7DaysFromDb";
import { supabase } from "@/lib/supabase/client";
import VerifyEmailBanner from "@/app/components/VerifyEmailBanner";
import { BROKERS_CONFIG } from "@/lib/brokers-config";
import { BROKERS } from "@/lib/brokers";



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

type ChampionRow = {
  id: string;
  title: string;
  winner_name: string;
  winner_profit: number | null;
  winner_roi: number | null;
  partner_name: string | null;
  end_date: string | null;
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
  { name: "Exness", logo: "/brokers/exness.png", regulated: true },
  { name: "IC Markets", logo: "/brokers/icmarkets.png", regulated: true },
  { name: "Vantage", logo: "/brokers/vantage.png", regulated: true },
  { name: "FXTM", logo: "/brokers/fxtm.png", regulated: true },
];

const leaderboardWeek: LeaderRow[] = [
  { rank: 1, trader: "Trader_Alpha", roi: 18.6, profit: 1240, maxDD: 4.2, trades: 38 },
  { rank: 2, trader: "MarketWolf", roi: 14.1, profit: 980, maxDD: 5.1, trades: 42 },
  { rank: 3, trader: "FX_King", roi: 10.9, profit: 710, maxDD: 6.3, trades: 33 },
  { rank: 4, trader: "PipSniper", roi: 8.1, profit: 540, maxDD: 7.0, trades: 29 },
  { rank: 5, trader: "LondonOpen", roi: 6.3, profit: 420, maxDD: 7.6, trades: 24 },
];

const demoChampions: ChampionRow[] = [
  {
    id: "demo-1",
    title: "Weekly Trade",
    winner_name: "Trader_Alpha",
    winner_profit: 1240,
    winner_roi: 18.6,
    partner_name: "FXLeagues",
    end_date: "2026-02-10",
  },
  {
    id: "demo-2",
    title: "Monthly Trade",
    winner_name: "MarketWolf",
    winner_profit: 980,
    winner_roi: 14.1,
    partner_name: "VANTAGE FX",
    end_date: "2026-02-03",
  },
  {
    id: "demo-3",
    title: "Daily Winner",
    winner_name: "FX_King",
    winner_profit: 710,
    winner_roi: 10.9,
    partner_name: "IC Markets",
    end_date: "2026-01-28",
  },
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
  const [champions, setChampions] = useState<ChampionRow[]>([]);
  const [loadingChampions, setLoadingChampions] = useState(true);
  const displayedChampions = champions.length === 0 ? demoChampions : champions;
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
useEffect(() => {
  async function fetchChampions() {
    const { data, error } = await supabase
      .from("tournaments")
      .select("id, title, winner_name, winner_profit, winner_roi, partner_name, end_date")
      .eq("status", "COMPLETED")
      .not("winner_name", "is", null)
      .order("end_date", { ascending: false })
      .limit(3);

    if (!error && data) setChampions(data as ChampionRow[]);
    setLoadingChampions(false);
  }

  fetchChampions();
}, []);

const now = new Date();

// ✅ ما عاد نستخدم nearest القديم نهائيًا
const nearest: any = null;
const nearestStatus: "UPCOMING" | "LIVE" = "UPCOMING";
const liveId: string | undefined = undefined;


  return (
  <main className="min-h-screen bg-black text-white">
    
    <Suspense fallback={null}>
  <VerifyEmailBanner />
</Suspense>

    {/* HERO (full width feel + cleaner spacing) */}
<section className="max-w-7xl mx-auto px-6 pt-8 pb-16">
            <div className="w-full rounded-[28px] border border-zinc-800/90 ring-1 ring-white/5 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-black p-6 sm:p-8 md:p-12 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_90px_rgba(0,0,0,0.85)]">          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
<h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight">                <span className="text-yellow-400">Win prizes.</span>
              </h1>

              <p className="text-zinc-300/90 mt-7 max-w-2xl">
                Compete in verified Forex tournaments. Prove your strategy. Win real prizes.
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
                <Link
  href="/winners"
  className="border border-zinc-700 px-5 py-3 rounded-lg hover:bg-zinc-900 transition"
>
  Winners
</Link>
              </div>

              <div className="mt-8 hidden sm:flex flex-wrap gap-2">
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
            <div className="hidden lg:block lg:col-span-4">
              <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950/70 to-black p-6 shadow-xl">
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-yellow-500/10 blur-3xl" />
<div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-white/5 blur-3xl" />

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

{/* MOBILE – Compact Next Tournament */}
<div className="lg:hidden max-w-7xl mx-auto px-6 -mt-10 pb-8">
  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center justify-between gap-4">

    <div>
      <div className="text-xs text-zinc-400">Next tournament</div>
      <div className="font-semibold text-sm mt-1">
        {loadingNext ? "Loading..." : nextTournament?.title ?? "—"}
      </div>
      <div className="text-xs text-zinc-500 mt-1">
        {nextTournament
          ? new Date(nextTournament.start_date).toLocaleDateString()
          : ""}
      </div>
    </div>

    <Link
      href="/schedule"
      className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-xs font-semibold hover:bg-yellow-400 transition"
    >
      View
    </Link>

  </div>
</div>

     {/* TRUSTED BROKERS STRIP (FIX: no drop to 2nd line on desktop) */}
<section className="max-w-7xl mx-auto px-6 pt-1 pb-6">
  <div
    className="relative overflow-hidden rounded-3xl border border-zinc-800 
               bg-gradient-to-b from-zinc-950/90 via-black to-black 
               p-12 
               shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_40px_120px_rgba(0,0,0,0.9)]"
  >

    {/* subtle glow */}
    <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-yellow-500/5 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-yellow-500/5 blur-3xl" />

    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      
      <div>
        <div className="text-xl font-bold text-white tracking-tight">
          Official Tournament Partners
        </div>

        <div className="text-sm text-zinc-400 mt-2 max-w-md leading-relaxed">
          Trade with official partners and join competitions.
        </div>

        <div className="mt-4">
          <Link
            href="/sponsors"
            className="inline-flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-300
                       hover:bg-yellow-500/15 hover:border-yellow-500/60 transition"
          >
            Become a Partner
            <span className="text-yellow-300/70">→</span>
          </Link>
        </div>
      </div>

            {/* Trusted Brokers */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
  {BROKERS_CONFIG.map((b) => (
  <Link
    key={b.key}
    href={b.href}
    target={b.newTab ? "_blank" : "_self"}
    className="h-16 md:h-24 rounded-xl border border-yellow-500/40 bg-gradient-to-b from-zinc-900/60 to-black 
               flex items-center justify-center px-3 md:px-8
               transition-all duration-300 
               hover:border-yellow-400/70 
               hover:shadow-[0_0_25px_rgba(234,179,8,0.25)]"
  >
    <Image
      src={b.logo}
      alt={b.name}
      width={160}
      height={52}
      className="w-full h-full object-contain"
    />
  </Link>
))}
</div>
          </div>
        </div>
      </section>


      <section className="max-w-7xl mx-auto px-6 pb-16">
  <Next7DaysFromDb title="Upcoming tournaments" limit={5} />
</section>
<section className="max-w-7xl mx-auto px-6 pb-16">
  <div className="flex items-start justify-between gap-6">
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight">1st Place Winners</h2>
      <p className="text-sm text-zinc-500 mt-1">
        From the last 3 completed tournaments.
      </p>
    </div>

    <Link href="/leaderboards" className="text-sm text-yellow-400 hover:underline">
      View all winners →
    </Link>
  </div>

  <div className="mt-6 relative overflow-hidden rounded-2xl md:rounded-3xl border border-zinc-800/90 ring-1 ring-white/5 bg-gradient-to-b from-zinc-950/70 via-zinc-950/30 to-black shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_90px_rgba(0,0,0,0.85)]">
  <div className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full bg-yellow-500/6 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
    <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-black/20">
      <div className="font-semibold">Last 3 tournaments</div>
      <div className="text-xs text-zinc-500">Showing 1st place only</div>
    </div>

    <div className="p-6">
      {loadingChampions ? (
        <div className="text-sm text-zinc-400">Loading winners...</div>
      ) : displayedChampions.length === 0 ? (
        <div className="text-sm text-zinc-400">No winners published yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {displayedChampions.map((c) => (
  <div
    key={c.id}
className="group relative overflow-hidden rounded-2xl min-h-[148px] border border-yellow-500/35 bg-gradient-to-b from-zinc-950/70 via-black/60 to-black p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_60px_rgba(0,0,0,0.65)] transition hover:border-yellow-400/60"  >
    {/* subtle glow */}
    <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

    {/* content */}
    <div className="relative grid grid-cols-[1fr_auto] gap-4 items-start">
      {/* Left: tournament + winner */}
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">
          Tournament
        </div>

        <div className="mt-1 text-lg font-extrabold tracking-tight text-white truncate">
          {c.title}
        </div>

        <div className="mt-4 text-[11px] uppercase tracking-wide text-zinc-500">
          Winner
        </div>

        <div className="mt-1 text-xl font-extrabold text-yellow-300 truncate">
          {c.winner_name}
        </div>
      </div>

      {/* Right: stacked stats (no overlap) */}
      <div className="flex flex-col gap-2 items-end">
        <div className="rounded-xl border border-zinc-800 bg-black/35 px-3 py-2 text-right min-w-[110px]">
          <div className="text-[11px] text-zinc-500">ROI</div>
          <div className="mt-0.5 text-base font-extrabold text-emerald-300">
            {c.winner_roi != null ? `+${c.winner_roi}%` : "—"}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-black/35 px-3 py-2 text-right min-w-[110px]">
          <div className="text-[11px] text-zinc-500">Profit</div>
          <div className="mt-0.5 text-base font-extrabold text-green-400">
            {c.winner_profit != null ? `+$${money(c.winner_profit)}` : "—"}
          </div>
        </div>
      </div>
    </div>
  </div>
))}
        </div>
      )}
    </div>
  </div>
</section>

      {/* HOW IT WORKS (clean steps cards) */}
<section id="how" className="max-w-7xl mx-auto px-6 pb-16">
  <div className="relative overflow-hidden rounded-3xl border border-zinc-800/90 ring-1 ring-white/5 bg-gradient-to-b from-zinc-950/80 via-zinc-950/40 to-black p-8 md:p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_40px_120px_rgba(0,0,0,0.9)]">
    {/* glow */}
    <div className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full bg-yellow-500/8 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

    <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
      <div>
        <div className="text-xs text-zinc-400">How it works</div>
        <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">
          Join in minutes — compete with clean rules
        </h2>
        <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
          A simple 5-step flow. You’ll appear on the leaderboard only after approval.
        </p>
      </div>

      <Link
        href="/schedule"
        className="inline-flex items-center justify-center bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-yellow-400 transition"
      >
        See tournaments →
      </Link>
    </div>

    {/* Steps grid */}
    <div className="relative mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {[
        { n: "1", t: "Join & accept rules", d: "Pick a tournament and confirm the rules." },
        { n: "2", t: "Download MT4/MT5", d: "Use MT4 or MT5 to get started fast." },
        { n: "3", t: "Create demo account", d: "Use $10,000 balance and 1:100 leverage." },
        { n: "4", t: "Submit account details", d: "Send login/investor details from the tournament page." },
        { n: "5", t: "Get approved & compete", d: "Once approved, you appear on the live leaderboard." },
      ].map((s) => (
        <div
          key={s.n}
          className="rounded-2xl border border-zinc-800 bg-black/30 p-5 hover:border-yellow-500/30 transition"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-yellow-500 text-black font-extrabold flex items-center justify-center">
              {s.n}
            </div>
            <div className="font-semibold">{s.t}</div>
          </div>
          <div className="mt-3 text-sm text-zinc-400 leading-relaxed">
            {s.d}
          </div>
        </div>
      ))}
    </div>

    {/* Requirements strip */}
    <div className="relative mt-6 rounded-2xl border border-zinc-800 bg-black/30 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="text-sm font-semibold text-white">Demo requirements</div>

      <div className="flex flex-wrap gap-2">
        <span className="text-[12px] px-3 py-1.5 rounded-full border border-zinc-800 bg-black/40 text-zinc-200">
          Balance: <span className="text-white font-semibold">$10,000</span>
        </span>
        <span className="text-[12px] px-3 py-1.5 rounded-full border border-zinc-800 bg-black/40 text-zinc-200">
          Leverage: <span className="text-white font-semibold">1:100</span>
        </span>
        <span className="text-[12px] px-3 py-1.5 rounded-full border border-zinc-800 bg-black/40 text-zinc-200">
          Platform: <span className="text-white font-semibold">MT4 / MT5</span>
        </span>
        <span className="text-[12px] px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-200">
          Verified before ranking
        </span>
      </div>

      <div className="text-xs text-zinc-500">
        Not approved? You won’t appear on the leaderboard.
      </div>
    </div>
  </div>
</section>

{/* BROKER SECTION - with heading */}
<section className="max-w-7xl mx-auto px-6 pb-20">
  
  {/* Title + subtitle */}
  <div className="text-center max-w-3xl mx-auto mb-12">
    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
      Compare Trusted Forex Brokers
    </h2>

    <p className="text-zinc-400 mt-4 text-sm md:text-base">
      Open a demo or real account with a regulated broker that matches your
      trading style. Compare platforms, spreads and key features.
    </p>
  </div>

  {/* Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {BROKERS.map((b) => (
      <div
        key={b.key}
        className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950/60 to-black p-6 hover:border-yellow-500/40 transition"
      >
        <div className="flex items-center justify-center h-16">
          <Image
            src={b.logo}
            alt={b.name}
            width={160}
            height={60}
            className="object-contain max-h-12"
          />
        </div>

        <div className="mt-5 text-center">
          <div className="text-lg font-extrabold">{b.name}</div>
          <div className="text-xs text-zinc-500 mt-1">{b.regulated}</div>

          <p className="text-sm text-zinc-400 mt-3 min-h-[40px]">
            {b.short}
          </p>

          <div className="mt-5 flex items-center justify-center gap-2">
            <a
              href={b.demoUrl}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold hover:bg-zinc-900 transition"
            >
              Demo
            </a>
            <a
              href={b.realUrl}
              className="rounded-lg bg-yellow-500 text-black px-4 py-2 text-sm font-semibold hover:bg-yellow-400 transition"
            >
              Real
            </a>
          </div>

          <div className="mt-4">
            <Link
              href={`/brokers/${b.key}`}
              className="text-sm text-yellow-400 hover:underline"
            >
              More info →
            </Link>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

{/* NEWSLETTER SECTION */}
<section className="max-w-7xl mx-auto px-6 pb-24">
  <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-black via-zinc-950/50 to-black p-10 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_30px_90px_rgba(0,0,0,0.9)]">

    {/* subtle glow */}
    <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-yellow-500/10 blur-3xl" />

    <h3 className="text-2xl md:text-3xl font-extrabold">
      Subscribe for upcoming tournaments
    </h3>

    <p className="mt-3 text-zinc-400 max-w-xl mx-auto text-sm">
      Be the first to know about new competitions, prize increases, and special events.
    </p>

    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 transition"
      />

      <button
        className="w-full sm:w-auto bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-yellow-400 transition"
      >
        Subscribe
      </button>
    </div>

    <div className="mt-4 text-xs text-zinc-600">
      No spam. Unsubscribe anytime.
    </div>
  </div>
</section>


{/* SPONSORS + CTA ... نفس كودك بدون تغيير */}
</main>
);
}