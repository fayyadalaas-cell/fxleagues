"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Row = {
  rank: number;
  user: string;
  pnl: number;
  winRate: number;
  maxDD: number;
  trades: number;
};

type Tab = "overview" | "leaderboard" | "prizes";

type DbTournament = {
  id: string; // uuid
  title: string;
  description: string | null;
  start_date: string | null; // timestamp
  end_date: string | null; // timestamp
  prize_pool: number | null;
  created_at: string;
  slug: string | null;

  // optional fields (as you added in SQL)
  status?: string | null; // LIVE / UPCOMING
  type?: string | null; // Daily / Weekly / Monthly / Special
  sponsor_name?: string | null;
  sponsor_logo_key?: string | null; // exness / fxleagues / icmarkets / ...
  entry?: string | null; // FREE
};

function normalizeSlug(raw: string) {
  // If you receive an old URL like sunday-major-0222 -> return sunday-major
  return (raw || "").replace(/-\d{4,}$/g, "");
}

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatDateTime(ts: string | null) {
  if (!ts) return { date: "—", time: "—" };
  const d = new Date(ts);
  const date = d.toISOString().slice(0, 10);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

function logoPathFromKey(key?: string | null) {
  // Images are under /public/brokers
  const k = (key || "").toLowerCase();
  const map: Record<string, string> = {
    exness: "/brokers/exness.png",
    fxleagues: "/brokers/fxleagues.png",
    icmarkets: "/brokers/icmarkets.png",
    binance: "/brokers/binance.png",
    fxm: "/brokers/fxtm.png",
    fxtm: "/brokers/fxtm.png",
    vantage: "/brokers/vantage.png",
  };
  return map[k] || "";
}

export default function TournamentDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const rawId = params?.id ?? "";
  const slug = rawId; // ✅ خليها زي ما هي بدون normalize

  const [tab, setTab] = useState<Tab>("overview");

  const [loading, setLoading] = useState(true);
  const [t, setT] = useState<DbTournament | null>(null);
  const [error, setError] = useState<string>("");

  // ✅ participants count + join state
  const [participantsCount, setParticipantsCount] = useState(0);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  // join modal
  const [openJoin, setOpenJoin] = useState(false);
  const [agree, setAgree] = useState(false);

  // ✅ credentials modal + form fields
  const [openCreds, setOpenCreds] = useState(false);
  const [platform, setPlatform] = useState("");
  const [login, setLogin] = useState("");
  const [investorPassword, setInvestorPassword] = useState("");
  const [server, setServer] = useState("");
  const [credentialsSubmitted, setCredentialsSubmitted] = useState(false);


  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      // Fetch tournament by slug (not uuid)
      const { data, error } = await supabase
        .from("tournaments")
        .select(
          "id,title,description,start_date,end_date,prize_pool,created_at,slug,status,type,sponsor_name,sponsor_logo_key,entry,participants_count"
        )


        .eq("slug", slug)
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setT(null);
        setParticipantsCount(0);
        setLoading(false);
        return;
      }

      if (!data) {
        setT(null);
        setParticipantsCount(0);
        setLoading(false);
        return;
      }

      setT(data as DbTournament);
      const { data: { session } } = await supabase.auth.getSession();

if (session) {
  const { data: reg } = await supabase
    .from("tournament_registrations")
    .select("id")
    .eq("tournament_id", (data as any).id)
    .eq("user_id", session.user.id)
    .maybeSingle();

  setAlreadyJoined(!!reg);
} else {
  setAlreadyJoined(false);
}

const countResponse = await supabase
  .from("tournament_registrations")
  .select("*", { count: "exact", head: true })
  .eq("tournament_id", (data as any).id);

setParticipantsCount(countResponse.count ?? 0);


// ✅ Get real participants count from tournament_registrations
const { count, error: countError } = await supabase
  .from("tournament_registrations")
  .select("*", { count: "exact", head: true })
  .eq("tournament_id", data.id);

if (!countError) {
  setParticipantsCount(count ?? 0);
  // check if already joined
const { data: regs, error: countError } = await supabase
  .from("tournament_registrations")
  .select("id")
  .eq("tournament_id", data.id);

if (!countError && regs) {
  setParticipantsCount(regs.length);
} else {
  setParticipantsCount(0);
}


} else {
  setParticipantsCount(0);
}


      if (!cancelled) setLoading(false);
    }

    if (slug) load();
    else {
      setLoading(false);
      setT(null);
      setParticipantsCount(0);
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const rows: Row[] = useMemo(
    () => [
      { rank: 1, user: "Trader_Alpha", pnl: 1240, winRate: 61, maxDD: 4.2, trades: 38 },
      { rank: 2, user: "MarketWolf", pnl: 980, winRate: 58, maxDD: 5.1, trades: 42 },
      { rank: 3, user: "FX_King", pnl: 710, winRate: 55, maxDD: 6.3, trades: 33 },
      { rank: 4, user: "PipSniper", pnl: 540, winRate: 52, maxDD: 7.0, trades: 29 },
      { rank: 5, user: "LondonOpen", pnl: 420, winRate: 50, maxDD: 7.6, trades: 24 },
    ],
    []
  );

  const top3 = rows.slice(0, 3);

  const TabButton = ({ value, label }: { value: Tab; label: string }) => {
    const active = tab === value;
    return (
      <button
        onClick={() => setTab(value)}
        className={
          active
            ? "bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
            : "border border-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-900"
        }
      >
        {label}
      </button>
    );
  };

  async function handleOpenJoin() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    router.push("/signin");
    return;
  }

  setAgree(false);
  setOpenJoin(true);
}


  async function handleJoinNow() {
  if (!agree || !t) return;

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    router.push("/signin");
    return;
  }

   const { error } = await supabase
  .rpc("join_tournament", {
    p_tournament_id: t.id,
  });




  if (error) {
  if ((error as any).code === "23505") {
    alert("You already joined this tournament.");
    setOpenJoin(false);
    return;
  }

  alert("Error joining tournament: " + error.message);
  return;
}


  alert("Successfully registered!");
  setAlreadyJoined(true);
  setOpenJoin(false);
  setParticipantsCount((c) => c + 1);

}

async function handleSubmitCredentials() {
  if (!t) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { error } = await supabase
    .from("tournament_credentials")
    .insert({
      tournament_id: t.id,
      user_id: session.user.id,
      platform,
      login,
      investor_password: investorPassword,
      server,
    });

  if (error) {
    alert("Error saving credentials: " + error.message);
    return;
  }

  alert("Credentials submitted successfully!");
setCredentialsSubmitted(true);
setOpenCreds(false);

}

  // UI states
  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <Link href="/schedule" className="text-yellow-400 hover:underline">
            ← Back to Schedule
          </Link>
          <h1 className="text-3xl font-bold mt-6">Loading…</h1>
          <p className="text-zinc-400 mt-2">Fetching tournament from Supabase.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <Link href="/schedule" className="text-yellow-400 hover:underline">
            ← Back to Schedule
          </Link>
          <h1 className="text-3xl font-bold mt-6">Error</h1>
          <p className="text-red-400 mt-2">{error}</p>
          <p className="text-zinc-500 mt-4 text-sm">
            Tip: Ensure <span className="text-white">tournaments</span> has a public read policy and your Supabase env
            vars in <span className="text-white">.env.local</span> are correct.
          </p>
        </div>
      </main>
    );
  }

  if (!t) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <Link href="/schedule" className="text-yellow-400 hover:underline">
            ← Back to Schedule
          </Link>

          <h1 className="text-4xl font-bold mt-6">Tournament not found</h1>
          <p className="text-zinc-400 mt-3">
            No tournament found with slug: <span className="text-white font-semibold">{slug}</span>
          </p>

          <div className="mt-6 text-sm text-zinc-500">
            Make sure the <span className="text-white">slug</span> column in Supabase matches the URL exactly.
          </div>
        </div>
      </main>
    );
  }

  const sponsorName = t.sponsor_name || "FXLeagues";
  const sponsorLogo = logoPathFromKey(t.sponsor_logo_key);
  const status = (t.status || "UPCOMING").toUpperCase();
  const type = t.type || "Daily";
  const entry = t.entry || "FREE";
  const prizePool = t.prize_pool ?? 0;

  const start = formatDateTime(t.start_date);
  const end = formatDateTime(t.end_date);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <Link href="/schedule" className="text-yellow-400 hover:underline">
              ← Back to Schedule
            </Link>

            <div className="flex items-center gap-3 mt-5">
              {sponsorLogo ? (
                <div className="h-10 w-10 rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden flex items-center justify-center">
                  <Image src={sponsorLogo} alt={sponsorName} width={40} height={40} />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-xl border border-zinc-800 bg-zinc-900/40" />
              )}

              <div className="leading-tight">
                <h1 className="text-4xl font-extrabold">
                  {t.title} <span className="text-yellow-400">Details</span>
                </h1>
                <p className="text-zinc-400 mt-1">{t.description ?? "—"}</p>
              </div>
            </div>

            <div className="mt-4 text-sm text-zinc-400">
              <span className="text-zinc-200 font-semibold">{start.date}</span> • {start.time} → {end.time} •
              <span className="ml-2 px-2 py-1 rounded-full border border-zinc-800 bg-black/30 text-xs">{type}</span>
              <span className="ml-2 px-2 py-1 rounded-full border border-zinc-800 bg-black/30 text-xs">{status}</span>
            </div>
          </div>

        <div className="flex gap-2 mt-2">
  <button
    onClick={() => alert("Rules popup later")}
    className="border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-900"
  >
    Rules
  </button>

  <button
    disabled={alreadyJoined || status === "CLOSED"}
    onClick={handleOpenJoin}
    className={
      status === "CLOSED" || alreadyJoined
        ? "bg-zinc-700 text-zinc-300 px-5 py-2 rounded-lg font-semibold cursor-not-allowed"
        : "bg-yellow-500 text-black px-5 py-2 rounded-lg font-semibold"
    }
  >
    {status === "CLOSED"
      ? "Closed"
      : alreadyJoined
      ? "Joined"
      : "Join Tournament"}
  </button>

 {alreadyJoined && status !== "CLOSED" && (
  <button
    disabled={credentialsSubmitted}
    onClick={() => setOpenCreds(true)}
    className={
      credentialsSubmitted
        ? "border border-zinc-700 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 cursor-not-allowed"
        : "border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-900"
    }
  >
    {credentialsSubmitted ? "Submitted" : "Submit Trading Details"}
  </button>
)}

</div>
</div>


        {/* Tabs */}
        <div className="mt-10 flex gap-2">
          <TabButton value="overview" label="Overview" />
          <TabButton value="leaderboard" label="Leaderboard" />
          <TabButton value="prizes" label="Prizes" />
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="text-xs text-zinc-400">Entry</div>
                <div className="text-2xl font-bold mt-1">{entry}</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="text-xs text-zinc-400">Prize Pool</div>
                <div className="text-2xl font-bold mt-1">${money(prizePool)}</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="text-xs text-zinc-400">Sponsor</div>
                <div className="text-2xl font-bold mt-1">{sponsorName}</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="text-xs text-zinc-400">Participants</div>
                <div className="text-2xl font-bold mt-1">{participantsCount}</div>
              </div>
            </div>

            {/* Times */}
            <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="text-xs text-zinc-400">Schedule</div>
              <div className="mt-2 text-sm text-zinc-300">
                Starts: <span className="text-white font-semibold">{start.date} {start.time}</span>
                <br />
                Ends: <span className="text-white font-semibold">{end.date} {end.time}</span>
              </div>

              <div className="mt-4 text-xs text-zinc-500">
                Note: Advanced fields (Platform / Leverage / Starting balance…) can be added later in DB if needed.
              </div>
            </div>

            {/* Top 3 demo */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {top3.map((p) => (
                <div key={p.rank} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-zinc-400">Rank</div>
                      <div className="text-3xl font-extrabold mt-1">#{p.rank}</div>
                    </div>

                    <div className="text-xs font-bold px-3 py-1 rounded-full border border-zinc-700 bg-black/40">
                      TOP 3
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-xl font-semibold">{p.user}</div>
                    <div className="text-sm text-zinc-400 mt-1">
                      Win Rate: {p.winRate}% • Max DD: {p.maxDD}% • Trades: {p.trades}
                    </div>

                    <div className="mt-4 flex items-baseline justify-between">
                      <div className="text-zinc-400 text-sm">PnL</div>
                      <div className="text-2xl font-bold text-green-400">+${money(p.pnl)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-sm text-zinc-400">
              Tip: Use the <span className="text-white font-semibold">Leaderboard</span> tab to view full standings.
            </div>
          </>
        )}

        {/* Leaderboard */}
        {tab === "leaderboard" && (
          <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Leaderboard</h2>
              <div className="text-sm text-zinc-400">Demo data</div>
            </div>

            <div className="px-6 py-3 text-xs text-zinc-400 grid grid-cols-6">
              <div>Rank</div>
              <div className="col-span-2">User</div>
              <div className="text-right">PnL</div>
              <div className="text-right">Win%</div>
              <div className="text-right">Max DD</div>
            </div>

            {rows.map((r) => (
              <div
                key={r.rank}
                className="px-6 py-4 border-t border-zinc-800 grid grid-cols-6 items-center hover:bg-black/30"
              >
                <div className="font-semibold">#{r.rank}</div>
                <div className="col-span-2">{r.user}</div>
                <div className="text-right font-semibold text-green-400">+${money(r.pnl)}</div>
                <div className="text-right">{r.winRate}%</div>
                <div className="text-right">{r.maxDD}%</div>
              </div>
            ))}
          </div>
        )}

        {/* Prizes */}
        {tab === "prizes" && (
          <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="text-sm text-zinc-400">
              Detailed prizes can be added later (separate prizes table or JSON column).
            </div>
            <div className="mt-4 text-2xl font-bold">Prize Pool: ${money(prizePool)}</div>
          </div>
        )}

        {/* Join Modal */}
        {openJoin && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative">
              <button
                onClick={() => setOpenJoin(false)}
                className="absolute right-4 top-4 text-zinc-400 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>

              <h3 className="text-xl font-bold">
                Join: <span className="text-yellow-400">{t.title}</span>
              </h3>

              <div className="mt-4 text-sm text-zinc-300">
                Required info (later): <span className="text-white font-semibold">email, phone, name</span> + trading
                login details.
              </div>

              <div className="mt-4 flex items-start gap-2 text-sm text-zinc-300">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="agree">
                  I agree to the <span className="text-yellow-400">tournament rules</span> and{" "}
                  <span className="text-yellow-400">privacy policy</span>.
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setOpenJoin(false)}
                  className="flex-1 border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-800"
                >
                  Cancel
                </button>

                <button
                  disabled={!agree}
                  onClick={handleJoinNow}
                  className={
                    agree
                      ? "flex-1 bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold"
                      : "flex-1 bg-yellow-500/40 text-black/60 px-4 py-2 rounded-lg font-semibold cursor-not-allowed"
                  }
                >
                  Join Now
                </button>
              </div>

              <div className="mt-3 text-xs text-zinc-500">(Demo UI only — later we store data in DB.)</div>
            </div>
          </div>
        )}
        {openCreds && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative">
      <button
        onClick={() => setOpenCreds(false)}
        className="absolute right-4 top-4 text-zinc-400 hover:text-white"
        aria-label="Close"
      >
        ✕
      </button>

      <h3 className="text-xl font-bold">Submit Demo Account Details</h3>
      <p className="mt-2 text-sm text-zinc-400">
        Open your demo account first, then submit your <span className="text-white">view-only</span> credentials.
      </p>

      <div className="mt-5 space-y-3">
        <div>
          <label className="text-xs text-zinc-400">Platform (MT4/MT5)</label>
          <input
  value={platform}
  onChange={(e) => setPlatform(e.target.value)}
  className="mt-1 w-full bg-black/30 border border-zinc-700 rounded-lg px-3 py-2 outline-none"
  placeholder="MT5"
/>

        </div>

        <div>
  <label className="text-xs text-zinc-400">Login</label>
  <input
    value={login}
    onChange={(e) => setLogin(e.target.value)}
    className="mt-1 w-full bg-black/30 border border-zinc-700 rounded-lg px-3 py-2 outline-none"
    placeholder="e.g. 12345678"
  />
</div>


        <div>
  <label className="text-xs text-zinc-400">Investor Password (view-only)</label>
  <input
    value={investorPassword}
    onChange={(e) => setInvestorPassword(e.target.value)}
    className="mt-1 w-full bg-black/30 border border-zinc-700 rounded-lg px-3 py-2 outline-none"
    placeholder="View-only password"
  />
</div>


        <div>
  <label className="text-xs text-zinc-400">Server</label>
  <input
    value={server}
    onChange={(e) => setServer(e.target.value)}
    className="mt-1 w-full bg-black/30 border border-zinc-700 rounded-lg px-3 py-2 outline-none"
    placeholder="e.g. Exness-MT5Real"
  />
</div>

      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => setOpenCreds(false)}
          className="flex-1 border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-800"
        >
          Cancel
        </button>

   <button
  disabled={!platform || !login || !investorPassword || !server}
  onClick={handleSubmitCredentials}
  className={
    !platform || !login || !investorPassword || !server
      ? "flex-1 bg-yellow-500/40 text-black/60 px-4 py-2 rounded-lg font-semibold cursor-not-allowed"
      : "flex-1 bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold"
  }
>

  Submit
</button>

      </div>

      <div className="mt-3 text-xs text-zinc-500">
        Note: We only accept <span className="text-white">view-only</span> credentials (Investor password).
      </div>
    </div>
  </div>
)}

      </div>
    </main>
  );
}
