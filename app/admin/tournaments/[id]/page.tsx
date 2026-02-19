"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type DbTournament = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  prize_pool: number | null;

  type: string | null;   // Daily / Weekly / Monthly / Special
  status: string | null; // LIVE / UPCOMING
  sponsor_name: string | null;
  sponsor_logo_key: string | null; // exness / icmarkets / ...
  entry: string | null;  // FREE
};

function toInputDateTime(ts: string | null) {
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromInputDateTime(v: string) {
  if (!v) return null;
  const d = new Date(v);
  return d.toISOString();
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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");
      setOkMsg("");

      const { data, error } = await supabase
        .from("tournaments")
        .select("id,title,slug,description,start_date,end_date,prize_pool,type,status,sponsor_name,sponsor_logo_key,entry")
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

      setLoading(false);
    }

    if (id) load();
    else setLoading(false);

    return () => {
      cancelled = true;
    };
  }, [id]);

  const safeSlug = useMemo(() => {
    // لو تركته فاضي، نعمله من العنوان
    const base = (slug || title || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return base || "";
  }, [slug, title]);

  async function handleSave() {
    if (!t) return;
    setSaving(true);
    setErr("");
    setOkMsg("");

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
    };

    const { error } = await supabase.from("tournaments").update(payload).eq("id", t.id);

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
              إذا طلعلك نفس رسالة RLS وقت الحفظ: هذا يعني بدنا نعمل Policy للـ <b>UPDATE</b> بعدين (خطوة بسيطة).
            </div>
          </div>
        )}

        {okMsg && (
          <div className="mt-6 rounded-xl border border-emerald-900/50 bg-emerald-950/40 p-4 text-sm text-emerald-200">
            {okMsg}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <div className="text-xs text-zinc-400 mb-2">Title</div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                  placeholder="Daily Sprint"
                />
              </label>

              <label className="block">
                <div className="text-xs text-zinc-400 mb-2">Slug (auto if empty)</div>
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
                <div className="text-xs text-zinc-400 mb-2">Start date</div>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                />
              </label>

              <label className="block">
                <div className="text-xs text-zinc-400 mb-2">End date</div>
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                />
              </label>

              <label className="block">
                <div className="text-xs text-zinc-400 mb-2">Prize pool</div>
                <input
                  type="number"
                  value={prizePool}
                  onChange={(e) => setPrizePool(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                />
              </label>

              <label className="block">
                <div className="text-xs text-zinc-400 mb-2">Entry</div>
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
                <div className="text-xs text-zinc-400 mb-2">Type</div>
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
                <div className="text-xs text-zinc-400 mb-2">Status</div>
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
                <div className="text-xs text-zinc-400 mb-2">Sponsor name</div>
                <input
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                  placeholder="Exness"
                />
              </label>

              <label className="block">
                <div className="text-xs text-zinc-400 mb-2">Sponsor logo key</div>
                <input
                  value={sponsorKey}
                  onChange={(e) => setSponsorKey(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                  placeholder="exness / icmarkets / vantage / fxleagues"
                />
              </label>

              <label className="block md:col-span-2">
                <div className="text-xs text-zinc-400 mb-2">Description</div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[110px] w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none"
                  placeholder="Optional description…"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
