"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

type PrizeItem = { position: number; amount: number };

export default function NewTournamentPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [start, setStart] = useState(""); // datetime-local
  const [end, setEnd] = useState(""); // datetime-local

  const [prize, setPrize] = useState<number>(0); // prize_pool
  const [winnersCount, setWinnersCount] = useState<number>(3);
  const [prizeBreakdown, setPrizeBreakdown] = useState<PrizeItem[]>([
    { position: 1, amount: 0 },
    { position: 2, amount: 0 },
    { position: 3, amount: 0 },
  ]);

  const [type, setType] = useState("Daily");
  const [status, setStatus] = useState("UPCOMING");
  const [entry, setEntry] = useState("FREE");

  const [sponsorName, setSponsorName] = useState("");
  const [sponsorKey, setSponsorKey] = useState("");

  const [loading, setLoading] = useState(false);

  function clampInt(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, Math.trunc(n)));
  }

  function makeSlug(input: string) {
    return (input || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // remove weird chars
      .replace(/\s+/g, "-") // spaces -> dashes
      .replace(/-+/g, "-") // multiple dashes -> one
      .replace(/^-+|-+$/g, "");
  }

  function fromInputDateTime(v: string) {
    if (!v) return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  }

  // keep prizeBreakdown length aligned with winnersCount
  useEffect(() => {
    const wc = clampInt(Number(winnersCount || 1), 1, 20);
    setPrizeBreakdown((prev) => {
      const map = new Map<number, number>();
      prev.forEach((p) => map.set(p.position, Number(p.amount) || 0));
      return Array.from({ length: wc }, (_, i) => ({
        position: i + 1,
        amount: map.get(i + 1) ?? 0,
      }));
    });
  }, [winnersCount]);

  const safeSlug = useMemo(() => {
    const base = makeSlug(slug ? slug : title);
    return base || "";
  }, [slug, title]);

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
    const pool = Number(prize || 0);
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
    const pool = Number(prize || 0);
    const wc = clampInt(Number(winnersCount || 1), 1, 20);
    const each = wc > 0 ? pool / wc : 0;

    const next: PrizeItem[] = Array.from({ length: wc }, (_, i) => ({
      position: i + 1,
      amount: Math.round(each),
    }));

    setPrizeBreakdown(next);
  }

  async function handleCreate() {
    if (!title.trim()) return alert("Title required");
    if (!start) return alert("Start date required");

    const wc = clampInt(Number(winnersCount || 1), 1, 20);

    setLoading(true);

    const cleanedBreakdown = Array.from({ length: wc }, (_, i) => ({
      position: i + 1,
      amount: Math.max(0, Number(prizeBreakdown[i]?.amount ?? 0) || 0),
    }));

    const payload = {
      title: title.trim(),
      slug: safeSlug || null,
      description: description.trim() || null,

      start_date: fromInputDateTime(start),
      end_date: end ? fromInputDateTime(end) : null,

      prize_pool: Number(prize || 0),
      type,
      status,
      entry,

      sponsor_name: sponsorName.trim() || null,
      sponsor_logo_key: sponsorKey.trim() || null,

      winners_count: wc,
      prize_breakdown: cleanedBreakdown,
    };

    const { error } = await supabase.from("tournaments").insert(payload);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/admin/tournaments");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/admin/tournaments" className="text-yellow-400 hover:underline text-sm">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold mt-4">New Tournament</h1>

        <div className="mt-6 flex flex-col gap-4">
          <input
            className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
            placeholder="Slug (optional)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

          <div className="text-xs text-zinc-500">
            Final slug: <span className="text-zinc-200">{safeSlug || "—"}</span>
          </div>

          <textarea
            className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg min-h-[90px]"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Start Date */}
          <input
            type="datetime-local"
            className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />

          {/* End Date */}
          <input
            type="datetime-local"
            className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
              placeholder="Prize pool"
              value={prize}
              onChange={(e) => setPrize(Number(e.target.value))}
            />

            <input
              type="number"
              min={1}
              max={20}
              className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
              placeholder="Number of winners"
              value={winnersCount}
              onChange={(e) => setWinnersCount(clampInt(Number(e.target.value || 1), 1, 20))}
            />
          </div>

          {/* Sponsor fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
              placeholder="Sponsor name (e.g. Exness)"
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
            />

            <input
              className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
              placeholder="Sponsor logo key (exness / icmarkets / ...)"
              value={sponsorKey}
              onChange={(e) => setSponsorKey(e.target.value)}
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
          </div>

          {/* Entry / Type / Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
            >
              <option value="FREE">FREE</option>
              <option value="PAID">PAID (later)</option>
            </select>

            <select
              className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Special</option>
            </select>

            {/* Status: UPCOMING / COMPLETED for now */}
            <select
              className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="UPCOMING">UPCOMING</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          {/* Prize breakdown editor */}
          <div className="mt-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Prize Breakdown</div>
                <div className="mt-1 text-xs text-zinc-400">
                  Total:{" "}
                  <span className={breakdownSum > (Number(prize || 0) || 0) ? "text-red-300" : "text-zinc-200"}>
                    ${breakdownSum.toFixed(0)}
                  </span>{" "}
                  / Prize pool: <span className="text-zinc-200">${Number(prize || 0).toFixed(0)}</span>
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
                  <div className="mb-2 text-xs text-zinc-400">Position #{p.position}</div>
                  <input
                    type="number"
                    min={0}
                    className="bg-black/40 border border-zinc-800 px-4 py-2 rounded-lg w-full"
                    value={p.amount}
                    onChange={(e) => setAmountFor(p.position, Number(e.target.value))}
                    placeholder="0"
                  />
                </label>
              ))}
            </div>

            <div className="mt-3 text-[11px] text-zinc-500">
              اكتب الجوائز يدويًا. الواجهة العامة رح تعرضها مثل ما هي.
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Tournament"}
          </button>
        </div>
      </div>
    </main>
  );
}