"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type PrizeItem = { position: number; amount: number };

type DbTournament = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  prize_pool: number | null;

  type: string | null; // Daily / Weekly / Monthly / Special
  status: string | null; // LIVE / UPCOMING
  sponsor_name: string | null;
  sponsor_logo_key: string | null; // exness / icmarkets / ...
  entry: string | null; // FREE

  winners_count: number | null;
  prize_breakdown: any[] | null; // JSONB
};

type DbRegistrant = {
  registration_id: string;
  tournament_id: string;
  user_id: string;
  status: string | null;
  details_submitted: boolean | null;
  registered_at: string | null;

  full_name: string | null;
  email: string | null;
  phone: string | null;
  username: string | null;

  platform: string | null;
  login: string | null;
  investor_password: string | null;
  server: string | null;
};

function toInputDateTime(ts: string | null) {
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function fromInputDateTime(v: string) {
  if (!v) return null;
  const d = new Date(v);
  return d.toISOString();
}

function fmtDate(ts: string | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString();
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function parseBreakdown(raw: any[] | null, winnersCount: number): PrizeItem[] {
  // raw expected: [{position:1, amount:100}, ...]
  const arr = Array.isArray(raw) ? raw : [];
  const map = new Map<number, number>();

  for (const item of arr) {
    const pos = Number(item?.position);
    const amt = Number(item?.amount);
    if (Number.isFinite(pos) && pos >= 1 && pos <= winnersCount && Number.isFinite(amt)) {
      map.set(pos, Math.max(0, amt));
    }
  }

  return Array.from({ length: winnersCount }, (_, i) => ({
    position: i + 1,
    amount: map.get(i + 1) ?? 0,
  }));
}

export default function AdminTournamentDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>("");
  const [okMsg, setOkMsg] = useState<string>("");

  const [t, setT] = useState<DbTournament | null>(null);

  // Registrants state
  const [regsLoading, setRegsLoading] = useState(true);
  const [regsErr, setRegsErr] = useState<string>("");
  const [registrants, setRegistrants] = useState<DbRegistrant[]>([]);

  // demo popup state
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoRow, setDemoRow] = useState<DbRegistrant | null>(null);

  // per-row action loading
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});

  async function updateRegistrationStatus(registrationId: string, newStatus: "approved" | "rejected") {
    setRegsErr("");
    setOkMsg("");

    setRowBusy((m) => ({ ...m, [registrationId]: true }));

    const { error } = await supabase
      .from("tournament_registrations")
      .update({ status: newStatus })
      .eq("id", registrationId);

    if (error) {
      setRegsErr(error.message);
      setRowBusy((m) => ({ ...m, [registrationId]: false }));
      return;
    }

    // update UI instantly بدون reload
    setRegistrants((prev) =>
      prev.map((r) =>
        r.registration_id === registrationId ? { ...r, status: newStatus } : r
      )
    );

    setOkMsg("Updated ✅");
    setRowBusy((m) => ({ ...m, [registrationId]: false }));
  }

  // form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [prizePool, setPrizePool] = useState<number>(0);
  const [type, setType] = useState("Daily");
  const [status, setStatus] = useState("UPCOMING");
  const [entry, setEntry] = useState("FREE");
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorKey, setSponsorKey] = useState("");
  const [description, setDescription] = useState("");

  const [winnersCount, setWinnersCount] = useState<number>(3);
  const [prizeBreakdown, setPrizeBreakdown] = useState<PrizeItem[]>([
    { position: 1, amount: 0 },
    { position: 2, amount: 0 },
    { position: 3, amount: 0 },
  ]);

  // Load tournament
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");
      setOkMsg("");

      const { data, error } = await supabase
        .from("tournaments")
        .select(
          "id,title,slug,description,start_date,end_date,prize_pool,type,status,sponsor_name,sponsor_logo_key,entry,winners_count,prize_breakdown"
        )
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setErr(error.message);
        setT(null);
        setLoading(false);
        return;
      }

      if (!data) {
        setErr("Tournament not found");
        setT(null);
        setLoading(false);
        return;
      }

      const row = data as DbTournament;
      setT(row);

      setTitle(row.title ?? "");
      setSlug(row.slug ?? "");
      setStartAt(toInputDateTime(row.start_date));
      setEndAt(toInputDateTime(row.end_date));
      setPrizePool(row.prize_pool ?? 0);
      setType(row.type ?? "Daily");
      setStatus((row.status ?? "UPCOMING").toUpperCase());
      setEntry(row.entry ?? "FREE");
      setSponsorName(row.sponsor_name ?? "");
      setSponsorKey(row.sponsor_logo_key ?? "");
      setDescription(row.description ?? "");

      const wc = clampInt(Number(row.winners_count ?? 3), 1, 20);
      setWinnersCount(wc);

      // ✅ load prize_breakdown from DB if exists, else create empty
      setPrizeBreakdown(parseBreakdown(row.prize_breakdown, wc));

      setLoading(false);
    }

    if (id) load();
    else setLoading(false);

    return () => {
      cancelled = true;
    };
  }, [id]);

  // keep prizeBreakdown length aligned with winnersCount (when user changes it)
  useEffect(() => {
    setPrizeBreakdown((prev) => {
      const wc = clampInt(Number(winnersCount || 1), 1, 20);
      const map = new Map<number, number>();
      prev.forEach((p) => map.set(p.position, Number(p.amount) || 0));
      return Array.from({ length: wc }, (_, i) => ({
        position: i + 1,
        amount: map.get(i + 1) ?? 0,
      }));
    });
  }, [winnersCount]);

  // Load registrants for this tournament
  useEffect(() => {
    let cancelled = false;

    async function loadRegs() {
      if (!id) return;

      setRegsLoading(true);
      setRegsErr("");

      const { data, error } = await supabase
        .from("admin_tournament_registrants")
        .select(
          "registration_id,tournament_id,user_id,status,details_submitted,registered_at,full_name,email,phone,username,platform,login,investor_password,server"
        )
        .eq("tournament_id", id)
        .order("registered_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setRegsErr(error.message);
        setRegistrants([]);
        setRegsLoading(false);
        return;
      }

      setRegistrants((data as DbRegistrant[]) || []);
      setRegsLoading(false);
    }

    loadRegs();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const safeSlug = useMemo(() => {
    const base = (slug || title || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return base || "";
  }, [slug, title]);

  function openDemo(r: DbRegistrant) {
    setDemoRow(r);
    setDemoOpen(true);
  }

  const breakdownSum = useMemo(() => {
    return prizeBreakdown.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [prizeBreakdown]);

  function setAmountFor(position: number, amount: number) {
    setPrizeBreakdown((prev) =>
      prev.map((p) =>
        p.position === position ? { ...p, amount: Math.max(0, Number(amount) || 0) } : p
      )
    );
  }

  function autoSplit503020() {
    const pool = Number(prizePool || 0);
    const wc = clampInt(Number(winnersCount || 1), 1, 20);

    const next: PrizeItem[] = Array.from({ length: wc }, (_, i) => {
      const pos = i + 1;
      let amount = 0;
      if (pos === 1) amount = pool * 0.5;
      else if (pos === 2) amount = pool * 0.3;
      else if (pos === 3) amount = pool * 0.2;
      else amount = 0;
      return { position: pos, amount: Math.round(amount) };
    });

    setPrizeBreakdown(next);
  }

  function equalSplit() {
    const pool = Number(prizePool || 0);
    const wc = clampInt(Number(winnersCount || 1), 1, 20);
    const each = wc > 0 ? pool / wc : 0;

    const next: PrizeItem[] = Array.from({ length: wc }, (_, i) => ({
      position: i + 1,
      amount: Math.round(each),
    }));

    setPrizeBreakdown(next);
  }

  async function handleSave() {
    if (!t) return;
    setSaving(true);
    setErr("");
    setOkMsg("");

    const wc = clampInt(Number(winnersCount || 1), 1, 20);

    const cleanedBreakdown = Array.from({ length: wc }, (_, i) => ({
      position: i + 1,
      amount: Math.max(0, Number(prizeBreakdown[i]?.amount ?? 0) || 0),
    }));

    const payload = {
      title: title.trim(),
      slug: safeSlug || null,
      description: description.trim() || null,
      start_date: fromInputDateTime(startAt),
      end_date: fromInputDateTime(endAt),
      prize_pool: Number(prizePool || 0),
      type: type,
      status: status,
      sponsor_name: sponsorName.trim() || null,
      sponsor_logo_key: sponsorKey.trim() || null,
      entry: entry,

      winners_count: wc,
      prize_breakdown: cleanedBreakdown,
    };

    const { error } = await supabase
      .from("tournaments")
      .update(payload)
      .eq("id", t.id);

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

    setOkMsg("Saved ✅");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <Link href="/admin/tournaments" className="text-yellow-400 hover:underline">
            ← Back
          </Link>
          <h1 className="mt-6 text-3xl font-bold">Loading…</h1>
          <p className="mt-2 text-zinc-400">Fetching tournament.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/admin/tournaments" className="text-yellow-400 hover:underline">
              ← Back to Tournaments
            </Link>
            <h1 className="mt-5 text-3xl font-extrabold">Tournament</h1>
            <p className="mt-1 text-sm text-zinc-400 break-all">{id}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/tournaments/${safeSlug || (t?.slug ?? "")}`)}
              className="rounded-lg border border-zinc-700/70 px-4 py-2 text-sm text-zinc-200 hover:bg-white/[0.04]"
            >
              Open public page
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !t}
              className={
                saving
                  ? "rounded-lg bg-yellow-500/40 px-5 py-2 text-sm font-semibold text-black/60 cursor-not-allowed"
                  : "rounded-lg bg-yellow-500 px-5 py-2 text-sm font-semibold text-black hover:brightness-95"
              }
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>

        {err && (
          <div className="mt-6 rounded-xl border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-200">
            {err}
            <div className="mt-2 text-xs text-red-300/80">
              إذا طلعلك رسالة RLS وقت الحفظ: هذا يعني بدنا نعمل Policy للـ <b>UPDATE</b> بعدين.
            </div>
          </div>
        )}

        {okMsg && (
          <div className="mt-6 rounded-xl border border-emerald-900/50 bg-emerald-950/40 p-4 text-sm text-emerald-200">
            {okMsg}
          </div>
        )}

        {/* Tournament form */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <div className="mb-2 text-xs text-zinc-400">Title</div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                  placeholder="Daily Sprint"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-xs text-zinc-400">Slug (auto if empty)</div>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                  placeholder="daily-sprint"
                />
                <div className="mt-2 text-[11px] text-zinc-500">
                  Final slug: <span className="text-zinc-200">{safeSlug || "—"}</span>
                </div>
              </label>

              <label className="block">
                <div className="mb-2 text-xs text-zinc-400">Start date</div>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-xs text-zinc-400">End date</div>
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-xs text-zinc-400">Prize pool</div>
                <input
                  type="number"
                  value={prizePool}
                  onChange={(e) => setPrizePool(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-xs text-zinc-400">Entry</div>
                <select
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                >
                  <option value="FREE">FREE</option>
                  <option value="PAID">PAID (later)</option>
                </select>
              </label>

              <label className="block">
                <div className="mb-2 text-xs text-zinc-400">Winners count</div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={winnersCount}
                  onChange={(e) => setWinnersCount(clampInt(Number(e.target.value || 1), 1, 20))}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                />
                <div className="mt-2 text-[11px] text-zinc-500">
                  This will generate <span className="text-zinc-200">{winnersCount}</span> prize inputs below.
                </div>
              </label>

              <label className="block">
                <div className="mb-2 text-xs text-zinc-400">Type</div>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Special">Special</option>
                </select>
              </label>

              <label className="block">
                <div className="mb-2 text-xs text-zinc-400">Status</div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                >
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="LIVE">LIVE</option>
                  <option value="ENDED">ENDED (later)</option>
                </select>
              </label>

              <label className="block">
                <div className="mb-2 text-xs text-zinc-400">Sponsor name</div>
                <input
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                  placeholder="Exness"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-xs text-zinc-400">Sponsor logo key</div>
                <input
                  value={sponsorKey}
                  onChange={(e) => setSponsorKey(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                  placeholder="exness / icmarkets / vantage / fxleagues"
                  list="sponsor-keys"
                />
                <datalist id="sponsor-keys">
                  <option value="exness" />
                  <option value="icmarkets" />
                  <option value="vantage" />
                  <option value="fxleagues" />
                  <option value="binance" />
                  <option value="fxtm" />
                </datalist>
              </label>

              <label className="block md:col-span-2">
                <div className="mb-2 text-xs text-zinc-400">Description</div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[110px] w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                  placeholder="Optional description…"
                />
              </label>
            </div>

            {/* Prize breakdown editor */}
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-black/20 p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Prize Breakdown</div>
                  <div className="mt-1 text-xs text-zinc-400">
                    أنت اللي تحدد الجوائز. المجموع الحالي:{" "}
                    <span className={breakdownSum > (Number(prizePool || 0) || 0) ? "text-red-300" : "text-zinc-200"}>
                      ${breakdownSum.toFixed(0)}
                    </span>{" "}
                    / Prize Pool: <span className="text-zinc-200">${Number(prizePool || 0).toFixed(0)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={autoSplit503020}
                    className="rounded-lg border border-zinc-700/70 px-3 py-2 text-xs text-zinc-200 hover:bg-white/[0.04]"
                  >
                    Auto 50/30/20
                  </button>
                  <button
                    type="button"
                    onClick={equalSplit}
                    className="rounded-lg border border-zinc-700/70 px-3 py-2 text-xs text-zinc-200 hover:bg-white/[0.04]"
                  >
                    Equal split
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {prizeBreakdown.map((p) => (
                  <label key={p.position} className="block">
                    <div className="mb-2 text-xs text-zinc-400">
                      Position #{p.position}
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={p.amount}
                      onChange={(e) => setAmountFor(p.position, Number(e.target.value))}
                      className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                      placeholder="0"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-3 text-[11px] text-zinc-500">
                ملاحظة: ما في “صح وغلط” هنا. أنت قرر القسمة، والواجهة العامة رح تعرضها كما هي.
              </div>
            </div>
          </div>

          {/* Registrants table */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Registrants</h2>
              <div className="text-sm text-zinc-400">
                {regsLoading ? "Loading…" : `${registrants.length} users`}
              </div>
            </div>

            {regsErr && (
              <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-200">
                {regsErr}
                <div className="mt-2 text-xs text-red-300/80">
                  إذا طلعلك “relation admin_tournament_registrants does not exist”
                  معناها الـ view مش معمولة أو اسمها مختلف.
                </div>
              </div>
            )}

            {!regsLoading && !regsErr && (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-zinc-400">
                    <tr className="border-b border-zinc-800">
                      <th className="py-2 pr-4 text-left">User</th>
                      <th className="py-2 pr-4 text-left">Email</th>
                      <th className="py-2 pr-4 text-left">Phone</th>
                      <th className="py-2 pr-4 text-left">Status</th>
                      <th className="py-2 pr-4 text-left">Demo</th>
                      <th className="py-2 pr-0 text-left">Registered</th>
                      <th className="py-2 pr-0 text-left">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {registrants.map((r) => (
                      <tr key={r.registration_id} className="border-b border-zinc-900">
                        <td className="py-3 pr-4">
                          <div className="font-semibold text-white">
                            {r.full_name || r.username || "—"}
                          </div>
                          <div className="text-xs text-zinc-500 break-all">{r.user_id}</div>
                          {r.username && (
                            <div className="mt-1 text-xs text-zinc-400">@{r.username}</div>
                          )}
                        </td>

                        <td className="py-3 pr-4 text-zinc-200">{r.email || "—"}</td>
                        <td className="py-3 pr-4 text-zinc-200">{r.phone || "—"}</td>

                        <td className="py-3 pr-4">
                          <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-200">
                            {r.status || "—"}
                          </span>
                        </td>

                        <td className="py-3 pr-4">
                          {r.details_submitted ? (
                            <button
                              type="button"
                              onClick={() => openDemo(r)}
                              className="text-left text-xs text-emerald-300 hover:underline"
                              title="View demo details"
                            >
                              {r.platform || "—"} / {r.login || "—"}
                            </button>
                          ) : (
                            <div className="text-xs text-yellow-300">PENDING</div>
                          )}
                        </td>

                        <td className="py-3 pr-0 text-xs text-zinc-400">{fmtDate(r.registered_at)}</td>

                        <td className="py-3 pr-0">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateRegistrationStatus(r.registration_id, "approved")}
                              disabled={!!rowBusy[r.registration_id] || r.status === "approved"}
                              className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-black disabled:opacity-50"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => updateRegistrationStatus(r.registration_id, "rejected")}
                              disabled={!!rowBusy[r.registration_id] || r.status === "rejected"}
                              className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-black disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {registrants.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-zinc-500">
                          No registrations yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Demo modal */}
      {demoOpen && demoRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 relative">
            <button
              onClick={() => setDemoOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold">Demo Account Details</h3>

            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                <div className="text-xs text-zinc-500">Platform</div>
                <div className="text-zinc-200">{demoRow.platform || "—"}</div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                <div className="text-xs text-zinc-500">Login</div>
                <div className="text-zinc-200">{demoRow.login || "—"}</div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                <div className="text-xs text-zinc-500">Investor Password</div>
                <div className="text-zinc-200 break-all">{demoRow.investor_password || "—"}</div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                <div className="text-xs text-zinc-500">Server</div>
                <div className="text-zinc-200 break-all">{demoRow.server || "—"}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}