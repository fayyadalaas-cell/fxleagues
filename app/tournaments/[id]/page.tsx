"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Row = {
  rank: number;
  user: string;
  pnl: number;
  winRate: number;
  maxDD: number;
  trades: number;
};

type Tab = "overview" | "leaderboard";

type DbTournament = {
  id: string; // uuid
  title: string;
  description: string | null;
  start_date: string | null; // timestamp
  end_date: string | null; // timestamp
  prize_pool: number | null;
  winners_count?: number | null;
  prize_breakdown?: any[] | null;
  created_at: string;
  slug: string | null;
  demo_signup_url?: string | null;
  platform_download_url?: string | null;
  sponsor_logo_url?: string | null;

  status?: string | null; // LIVE / UPCOMING / CLOSED
  type?: string | null; // Daily / Weekly / Monthly / Special
  sponsor_name?: string | null;
  sponsor_logo_key?: string | null;
  entry?: string | null; // FREE
};

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
  const k = (key || "").toLowerCase();

  const map: Record<string, string> = {
    exness: "/brokers/exness.png",
    icmarkets: "/brokers/icmarkets.png",
    fxtm: "/brokers/fxtm.png",
    fxm: "/brokers/fxtm.png",
    vantage: "/brokers/vantage.png",
  };

  return map[k] || "/brokers/exness.png"; // fallback افتراضي
}

type RegStage = "not_joined" | "joined" | "pending_review" | "approved" | "rejected";

function getStage(alreadyJoined: boolean, status: string | null): RegStage {
  if (!alreadyJoined) return "not_joined";
  const s = (status || "").toLowerCase();

  if (s === "approved") return "approved";
  if (s === "rejected") return "rejected";
  if (s === "pending_review") return "pending_review";
  if (s.includes("pending")) return "pending_review"; // covers joined_pending etc.

  return "joined";
}

/**
 * Fallback prize breakdown when DB doesn't provide prize_breakdown.
 * - winners=1 => 100%
 * - winners=2 => 70/30
 * - winners=3 => 50/30/20
 * - others => equal split
 */
function buildFallbackPrizes(prizePool: number, winnersCount: number) {
  const wc = Math.max(1, Math.min(50, Number(winnersCount || 1)));
  const pool = Math.max(0, Number(prizePool || 0));

  let weights: number[] = [];
  if (wc === 1) weights = [1];
  else if (wc === 2) weights = [0.7, 0.3];
  else if (wc === 3) weights = [0.5, 0.3, 0.2];
  else weights = Array.from({ length: wc }, () => 1 / wc);

  // normalize just in case
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  weights = weights.map((w) => w / sum);

  // amounts with rounding + last fix
  const raw = weights.map((w) => Math.round(pool * w));
  const diff = pool - raw.reduce((a, b) => a + b, 0);
  raw[raw.length - 1] = Math.max(0, raw[raw.length - 1] + diff);

  return raw.map((amount, i) => ({ position: i + 1, amount }));
}

export default function TournamentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const slug = (params?.id as string) ?? "";

  const [tab, setTab] = useState<Tab>("overview");

  const [loading, setLoading] = useState(true);
  const [t, setT] = useState<DbTournament | null>(null);
  const [error, setError] = useState<string>("");

  // participants count + join state
  const [participantsCount, setParticipantsCount] = useState(0);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);

  // join modal
  const [openJoin, setOpenJoin] = useState(false);
  const [agree, setAgree] = useState(false);

  // credentials modal + form fields
  const [openCreds, setOpenCreds] = useState(false);
  const [platform, setPlatform] = useState("");
  const [login, setLogin] = useState("");
  const [investorPassword, setInvestorPassword] = useState("");
  const [server, setServer] = useState("");
  const [credentialsSubmitted, setCredentialsSubmitted] = useState(false);
    // ✅ Refresh join/status from DB (single source of truth)
  async function refreshRegistration(tournamentId: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setAlreadyJoined(false);
      setRegistrationStatus(null);
      setCredentialsSubmitted(false);
      return;
    }

    // joined?
    const { data: reg } = await supabase
      .from("tournament_registrations")
      .select("id,status,details_submitted")
      .eq("tournament_id", tournamentId)
      .eq("user_id", session.user.id)
      .maybeSingle();

    setAlreadyJoined(!!reg);
    setRegistrationStatus((reg as any)?.status ?? null);

    // credentials submitted?
    const { data: creds } = await supabase
      .from("tournament_credentials")
      .select("id")
      .eq("tournament_id", tournamentId)
      .eq("user_id", session.user.id)
      .maybeSingle();

    setCredentialsSubmitted(!!creds);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("tournaments")
        .select(
  "id,title,description,start_date,end_date,prize_pool,created_at,slug,status,type,sponsor_name,sponsor_logo_key,sponsor_logo_url,entry,winners_count,prize_breakdown,demo_signup_url,platform_download_url"
)
        .eq("slug", slug)
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setT(null);
        setParticipantsCount(0);
        setAlreadyJoined(false);
        setCredentialsSubmitted(false);
        setLoading(false);
        return;
      }

      if (!data) {
        setT(null);
        setParticipantsCount(0);
        setAlreadyJoined(false);
        setCredentialsSubmitted(false);
        setLoading(false);
        return;
      }

      setT(data as DbTournament);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      // participants count
      const countRes = await supabase
        .from("tournament_registrations")
        .select("*", { count: "exact", head: true })
        .eq("tournament_id", data.id);

      setParticipantsCount(countRes.count ?? 0);

      if (!session) {
        setAlreadyJoined(false);
        setCredentialsSubmitted(false);
        setLoading(false);
        return;
      }

      // joined?
      const { data: reg } = await supabase
        .from("tournament_registrations")
        .select("id,status,details_submitted")
        .eq("tournament_id", data.id)
        .eq("user_id", session.user.id)
        .maybeSingle();

      setAlreadyJoined(!!reg);
      setRegistrationStatus((reg as any)?.status ?? null);

      // credentials submitted?
      const { data: creds } = await supabase
        .from("tournament_credentials")
        .select("id")
        .eq("tournament_id", data.id)
        .eq("user_id", session.user.id)
        .maybeSingle();

      setCredentialsSubmitted(!!creds);

      if (!cancelled) setLoading(false);
    }

    if (slug) load();
    else {
      setLoading(false);
      setT(null);
      setParticipantsCount(0);
      setAlreadyJoined(false);
      setCredentialsSubmitted(false);
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // demo rows (replace later with real source)
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
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/signin");
      return;
    }

    setAgree(false);
    setOpenJoin(true);
  }

  async function handleJoinNow() {
    if (!agree || !t) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/signin");
      return;
    }

    const { error } = await supabase.rpc("join_tournament", {
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
    await refreshRegistration(t.id);
    setOpenJoin(false);
    setParticipantsCount((c) => c + 1);
  }

  async function handleSubmitCredentials() {
    if (!t) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { error: credErr } = await supabase
      .from("tournament_credentials")
      .upsert(
        {
          tournament_id: t.id,
          user_id: session.user.id,
          platform,
          login,
          investor_password: investorPassword,
          server,
          status: "submitted",
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: "tournament_id,user_id" }
      );

    if (credErr) {
      alert("Error saving credentials: " + credErr.message);
      return;
    }

    const { error: regErr } = await supabase
      .from("tournament_registrations")
      .update({ status: "pending_review", details_submitted: true })
      .eq("tournament_id", t.id)
      .eq("user_id", session.user.id);

    if (regErr) {
      alert("Saved credentials, but failed to update status: " + regErr.message);
      return;
    }

    alert("Credentials submitted successfully!");
    setCredentialsSubmitted(true);
    setRegistrationStatus("pending_review");
    setOpenCreds(false);
  }

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
  const status = (t.status || "UPCOMING").toUpperCase();
  const type = t.type || "Daily";
  const entry = t.entry || "FREE";
  const prizePool = t.prize_pool ?? 0;

  const start = formatDateTime(t.start_date);
  const end = formatDateTime(t.end_date);
  const sponsorKey = (t.sponsor_logo_key || "").toLowerCase();

  // platform links based on sponsor
  const platformLinks: Record<string, { downloadUrl: string; demoSignupUrl: string; platformName: string }> = {
    exness: {
      platformName: "MetaTrader 5 (Exness)",
      downloadUrl: "https://www.exness.com/platforms/metatrader-5/",
      demoSignupUrl: "https://www.exness.com/open-account/",
    },
    icmarkets: {
      platformName: "MetaTrader 5 (IC Markets)",
      downloadUrl: "https://www.icmarkets.com/global/en/trading-platforms/metatrader-5",
      demoSignupUrl: "https://www.icmarkets.com/global/en/open-trading-account",
    },
    vantage: {
      platformName: "MetaTrader 5 (Vantage)",
      downloadUrl: "https://www.vantagemarkets.com/trading-platforms/metatrader-5/",
      demoSignupUrl: "https://www.vantagemarkets.com/open-live-account/",
    },
    fxleagues: {
      platformName: "MetaTrader 5",
      downloadUrl: "#",
      demoSignupUrl: "#",
    },
  };

  const platformInfo = {
  platformName:
    sponsorKey === "exness"
      ? "MetaTrader 5 (Exness)"
      : sponsorKey === "icmarkets"
      ? "MetaTrader 5 (IC Markets)"
      : sponsorKey === "vantage"
      ? "MetaTrader 5 (Vantage)"
      : "MetaTrader 5",
  downloadUrl: t.platform_download_url || platformLinks[sponsorKey]?.downloadUrl || "#",
  demoSignupUrl: t.demo_signup_url || platformLinks[sponsorKey]?.demoSignupUrl || "#",
};

  const LEVERAGE = "1:100";
  const STARTING_BALANCE = "$10,000";

  const stage = getStage(alreadyJoined, registrationStatus);

  const steps = [
  { key: "download", title: "Download Platform", action: "download" },
  { key: "demo", title: "Create Demo Account", action: "demo" },
  { key: "submit", title: "Submit Trading Details", action: "submit" },
  { key: "review", title: "Wait for Approval", action: "review" },
] as const;

  function stepDone(key: (typeof steps)[number]["key"]) {
    if (stage === "not_joined") return false;
    if (key === "download") return true;
    if (key === "demo") return true;
    if (key === "submit") return credentialsSubmitted || stage === "pending_review" || stage === "approved";
    if (key === "review") return stage === "approved";
    return false;
  }

  function stepCurrent(key: (typeof steps)[number]["key"]) {
    if (stage === "not_joined") return false;
    if (stage === "joined") return key === "submit";
    if (stage === "pending_review") return key === "review";
    return false;
  }

  const hint =
    stage === "not_joined"
      ? "Join the tournament to unlock the next steps."
      : stage === "joined"
      ? "Next: Create a demo account and submit your trading details."
      : stage === "pending_review"
      ? "Your trading details are submitted. Please wait for approval."
      : stage === "approved"
      ? "Approved ✅ You’re ready to trade."
      : "Rejected ❌ Please resubmit correct trading details.";

  // ✅ Prize breakdown: DB first, fallback second
  const dbPrizes = Array.isArray((t as any).prize_breakdown) ? ((t as any).prize_breakdown as any[]) : [];
  const winnersCount = Math.max(1, Number(t.winners_count || dbPrizes.length || 1));
  const finalPrizes =
    dbPrizes.length > 0
      ? dbPrizes
          .map((p) => ({ position: Number(p.position || 0), amount: Number(p.amount || 0) }))
          .filter((p) => p.position > 0)
          .sort((a, b) => a.position - b.position)
      : buildFallbackPrizes(prizePool, winnersCount);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col gap-6">
          {/* Row 1 */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="min-w-0">
              <Link href="/schedule" className="text-yellow-400 hover:underline">
                ← Back to Schedule
              </Link>

              <div className="flex items-center gap-4 mt-5">
  {(t.sponsor_logo_url || sponsorKey) && (
  <img
    src={
      t.sponsor_logo_url &&
      (t.sponsor_logo_url.startsWith("http") ||
        t.sponsor_logo_url.startsWith("/"))
        ? t.sponsor_logo_url
        : logoPathFromKey(sponsorKey)
    }
    alt={sponsorName || "Sponsor"}
    className="h-12 w-auto object-contain rounded-lg bg-white p-1"
  />
)}

  <div className="leading-tight min-w-0">
    <h1 className="text-4xl font-extrabold truncate">
      {t.title} <span className="text-yellow-400">Details</span>
    </h1>

    {t.description ? (
      <p className="text-zinc-400 mt-1 line-clamp-2">{t.description}</p>
    ) : null}
  </div>
</div>
            </div>

            {/* Right actions */}
<div className="mt-2 grid grid-cols-2 gap-2 w-full md:w-auto md:min-w-[360px] md:justify-end">
  <button
    onClick={() => alert("Rules popup later")}
    className="h-10 w-full rounded-xl border border-zinc-700 bg-black/20 px-4 text-sm font-semibold text-white hover:bg-zinc-900"
  >
    Rules
  </button>

  {alreadyJoined ? (
    <div
      className={
        "h-10 w-full inline-flex items-center justify-center rounded-xl px-4 text-sm font-semibold border " +
        (registrationStatus === "approved"
          ? "border-emerald-700/50 bg-emerald-950/30 text-emerald-200"
          : registrationStatus === "rejected"
          ? "border-red-700/50 bg-red-950/30 text-red-200"
          : "border-yellow-700/50 bg-yellow-950/20 text-yellow-200")
      }
    >
      Status:&nbsp;
      <span className="font-bold">{registrationStatus || "joined_pending"}</span>
    </div>
  ) : (
    <div className="h-10 w-full" />
  )}

  {alreadyJoined ? (
    <div className="h-10 w-full inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/40 px-4 text-sm font-semibold text-zinc-200">
      Joined
    </div>
  ) : (
    <button
      disabled={status === "CLOSED"}
      onClick={handleOpenJoin}
      className={
        "h-10 w-full rounded-xl px-5 text-sm font-semibold " +
        (status === "CLOSED"
          ? "cursor-not-allowed bg-zinc-700 text-zinc-300"
          : "bg-yellow-500 text-black hover:brightness-95")
      }
    >
      {status === "CLOSED" ? "Closed" : "Join Tournament"}
    </button>
  )}

  {alreadyJoined && !credentialsSubmitted && status !== "CLOSED" ? (
    <button
      onClick={() => setOpenCreds(true)}
      className="h-10 w-full rounded-xl border border-zinc-700 bg-black/20 px-4 text-sm font-semibold text-white hover:bg-zinc-900"
    >
      Submit Trading Details
    </button>
  ) : alreadyJoined && credentialsSubmitted ? (
    <div className="h-10 w-full inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/40 px-4 text-sm font-semibold text-zinc-300">
      Submitted
    </div>
  ) : (
    <div className="h-10 w-full" />
  )}
  </div>
</div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="text-xs text-zinc-400">Entry</div>
              <div className="text-3xl font-extrabold mt-2">{entry}</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="text-xs text-zinc-400">Prize Pool</div>
              <div className="text-3xl font-extrabold mt-2">${money(prizePool)}</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="text-xs text-zinc-400">Sponsor</div>
              <div className="text-3xl font-extrabold mt-2 truncate">{sponsorName}</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="text-xs text-zinc-400">Participants</div>
              <div className="text-3xl font-extrabold mt-2">{participantsCount}</div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-12 rounded-2xl border border-yellow-500/25 bg-gradient-to-b from-zinc-950/90 to-zinc-950/60 p-8 shadow-[0_0_0_1px_rgba(234,179,8,0.12),0_25px_70px_rgba(0,0,0,0.7)]">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="text-xl md:text-2xl font-extrabold tracking-tight">
                  Next steps
                  <span className="ml-2 text-xs font-semibold text-yellow-200/90 border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 rounded-full">
                    Required
                  </span>
                </div>
                <div className="mt-1 text-sm text-zinc-300/90">{hint}</div>
              </div>

              <div
                className={
                  stage === "approved"
                    ? "inline-flex items-center rounded-xl border border-emerald-700/40 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-200"
                    : stage === "rejected"
                    ? "inline-flex items-center rounded-xl border border-red-700/40 bg-red-950/30 px-3 py-2 text-xs text-red-200"
                    : "inline-flex items-center rounded-xl border border-yellow-700/40 bg-yellow-950/20 px-3 py-2 text-xs text-yellow-200"
                }
              >
                Status:&nbsp;
                <span className="font-semibold">{registrationStatus || "not_joined"}</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
              {steps.map((s, idx) => {
                const done = stepDone(s.key);
                const current = stepCurrent(s.key);

                return (
                  <div
                    key={s.key}
                    className={
                      "group rounded-2xl p-5 transition-all duration-200 min-h-[110px] " +
                      (done || (s.key === "review" && stage === "approved")
  ? "border border-emerald-700/40 bg-emerald-950/25 hover:bg-emerald-950/35"
                        : current
                        ? "border border-yellow-700/50 bg-yellow-950/15 shadow-[0_0_0_1px_rgba(234,179,8,0.10),0_16px_40px_rgba(0,0,0,0.55)] hover:bg-yellow-950/25"
                        : "border border-zinc-800 bg-black/20 hover:bg-zinc-950/40 hover:border-zinc-700")
                    }
                  >
                    <div className="flex items-center justify-between">
  <div className="text-xs text-zinc-400">Step {idx + 1}</div>
  <div className="text-xs">{done ? "✅" : current ? "👉" : ""}</div>
</div>

<div className="mt-2 text-base font-bold">{s.title}</div>

{/* 🔥 Badge خاص بـ Step 4 */}
{s.key === "review" && (
  <div
    className={
      "mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold border " +
      (stage === "approved"
        ? "border-emerald-700/40 bg-emerald-950/30 text-emerald-200"
        : stage === "rejected"
        ? "border-red-700/40 bg-red-950/30 text-red-200"
        : "border-yellow-700/40 bg-yellow-950/20 text-yellow-200")
    }
  >
    {stage === "approved"
      ? "Approved"
      : stage === "rejected"
      ? "Rejected"
      : "Pending Approval"}
  </div>
)}

{/* ⬇️ بعدها يجي زر download/demo */}
{(s.action === "download" || s.action === "demo") && (
  <a
    href={
      s.action === "download"
        ? platformInfo?.downloadUrl || "#"
        : platformInfo?.demoSignupUrl || "#"
    }
    target="_blank"
    rel="noreferrer"
    className={
      "mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold " +
      (stage === "not_joined"
        ? "cursor-not-allowed pointer-events-none opacity-40 border border-zinc-800 bg-black/20 text-zinc-200"
        : "bg-yellow-500 text-black hover:brightness-95")
    }
  >
    {s.action === "download" ? "Download" : "Open Demo Account"}
  </a>
)}

{s.key === "submit" && (
  <button
    type="button"
    onClick={() => setOpenCreds(true)}
    className={
      "mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold " +
      (!alreadyJoined || status === "CLOSED"
        ? "cursor-not-allowed pointer-events-none opacity-40 border border-zinc-800 bg-black/20 text-zinc-200"
        : credentialsSubmitted
        ? "cursor-not-allowed pointer-events-none opacity-60 border border-zinc-700 bg-zinc-900/40 text-zinc-300"
        : "bg-yellow-500 text-black hover:brightness-95")
    }
  >
    {credentialsSubmitted ? "Submitted" : "Submit Details"}
  </button>
)}

                    {s.key === "review" && (
  <div className="mt-2 text-xs text-zinc-400">
    {stage === "approved"
      ? "Approved ✅ You’re ready to trade."
      : stage === "rejected"
      ? "Rejected ❌ Please resubmit your details."
      : "We’ll approve you shortly."}
  </div>
)}

                  </div>
                );
              })}
            </div>
          </div>

          {/* ✅ Prize Distribution (ALWAYS shows) */}
          <div className="mt-6 w-full mx-auto rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">🏆 Prize Distribution</h2>
              <div className="text-xs text-zinc-400">Total Winners: {finalPrizes.length}</div>
            </div>

            <div className="mt-4 grid gap-3 justify-center [grid-template-columns:repeat(auto-fit,minmax(190px,220px))]">
              {finalPrizes.map((p: any) => {
                const pos = Number(p.position || 0);
                const amt = Number(p.amount || 0);

                const isFirst = pos === 1;
                const isSecond = pos === 2;
                const isThird = pos === 3;

                const style = isFirst
                  ? "bg-yellow-500 text-black shadow-lg"
                  : isSecond
                  ? "bg-zinc-800 border border-zinc-700 text-white"
                  : isThird
                  ? "bg-zinc-900 border border-zinc-800 text-white"
                  : "bg-black/30 border border-zinc-800 text-white";

                return (
                  <div key={pos} className={`w-full max-w-[230px] rounded-2xl p-5 text-center ${style} transition-all`}>
                    <div className="text-xs opacity-70">Position</div>
                    <div className="mt-1 text-2xl font-extrabold">#{pos}</div>

                    <div className="mt-1 text-2xl font-extrabold">${money(amt)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ✅ Meta row (بدون •) */}
          <div className="text-sm text-zinc-400">
            <span className="text-zinc-200 font-semibold">{start.date}</span> — {start.time} → {end.time}
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full border border-zinc-800 bg-black/30 text-xs">
              {type}
            </span>
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full border border-zinc-800 bg-black/30 text-xs">
              {status}
            </span>
          </div>

          {/* Steps cards */}
<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
    <div className="text-xs text-zinc-400">Step 1</div>
    <div className="mt-2 text-lg font-bold">Download Platform</div>
    <div className="mt-1 text-sm text-zinc-400">{platformInfo.platformName}</div>

    <a
      href={platformInfo.downloadUrl}
      target="_blank"
      rel="noreferrer"
      className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-yellow-500 px-4 py-3 text-sm font-semibold text-black hover:brightness-95"
    >
      Download
    </a>
  </div>

  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
    <div className="text-xs text-zinc-400">Step 2</div>
    <div className="mt-2 text-lg font-bold">Create Demo Account</div>
    <div className="mt-1 text-sm text-zinc-400">Open demo account with sponsor</div>

    <a
      href={platformInfo.demoSignupUrl}
      target="_blank"
      rel="noreferrer"
      className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-zinc-700 bg-black/30 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-900"
    >
      Open Demo Signup
    </a>
  </div>

  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
    <div className="text-xs text-zinc-400">Contest Rules</div>

    <div className="mt-3 text-sm text-zinc-300">
      <div>
        Leverage: <span className="text-white font-semibold">{LEVERAGE}</span>
      </div>
      <div className="mt-1">
        Starting Balance: <span className="text-white font-semibold">{STARTING_BALANCE}</span>
      </div>
    </div>

    <div className="mt-4 text-xs text-zinc-500">
      Use investor password only. No real trading required.
    </div>
  </div>
</div>
          {/* Tabs */}
          <div className="mt-10 flex gap-2">
            <TabButton value="overview" label="Overview" />
            <TabButton value="leaderboard" label="Leaderboard" />
          </div>

          {/* Overview */}
          {tab === "overview" && (
            <>
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

          {/* Credentials Modal */}
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

                <h3 className="text-xl font-bold">Submit Trading Details</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Open your demo account first, then submit your <span className="text-white">view-only</span>{" "}
                  credentials.
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
      </div>
    </main>
  );
}