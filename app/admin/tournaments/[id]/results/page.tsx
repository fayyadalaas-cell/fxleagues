"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Tournament = {
  id: string;
  title: string;
  winners_count: number | null;
  status: string;
};

type Registration = {
  user_id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
};

type WinnerFormRow = {
  rank: number;
  user_id: string;
  pnl: string; // input as string, we parse to number
};

type ResultRow = {
  tournament_id: string;
  user_id: string;
  rank: number;
  pnl: number | null;
};

function nameFor(r: Registration) {
  return r.full_name || r.username || r.email || r.user_id;
}

function errToPlain(e: any) {
  try {
    return {
      message: e?.message ?? null,
      code: e?.code ?? null,
      details: e?.details ?? null,
      hint: e?.hint ?? null,
      status: e?.status ?? null,
      name: e?.name ?? null,
    };
  } catch {
    return { message: "Unknown error" };
  }
}

export default function AdminTournamentResultsPage() {
  const params = useParams();
  const tournamentId = params?.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const [winners, setWinners] = useState<WinnerFormRow[]>([
    { rank: 1, user_id: "", pnl: "" },
    { rank: 2, user_id: "", pnl: "" },
    { rank: 3, user_id: "", pnl: "" },
  ]);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string>("");

  const regMap = useMemo(() => {
    const m = new Map<string, Registration>();
    registrations.forEach((r) => m.set(r.user_id, r));
    return m;
  }, [registrations]);

  useEffect(() => {
    async function load() {
      if (!tournamentId) return;

      setLoading(true);
      setSaveMsg("");

      // 1) tournament
      const { data: tData, error: tErr } = await supabase
        .from("tournaments")
        .select("id, title, winners_count, status")
        .eq("id", tournamentId)
        .single();

      if (tErr) console.error("tournament error:", errToPlain(tErr));
      setTournament((tData ?? null) as Tournament | null);

      // 2) registrations -> user_ids
      const { data: regData, error: regErr } = await supabase
        .from("tournament_registrations")
        .select("user_id")
        .eq("tournament_id", tournamentId);

      if (regErr) {
        console.error("registrations error:", errToPlain(regErr));
        setRegistrations([]);
        setLoading(false);
        return;
      }

      const userIds = (regData ?? [])
        .map((r: any) => r.user_id)
        .filter(Boolean) as string[];

      if (userIds.length === 0) {
        setRegistrations([]);
      } else {
        // 3) profiles for those users
        const { data: profilesData, error: pErr } = await supabase
          .from("profiles")
          .select("id, full_name, username, email")
          .in("id", userIds);

        if (pErr) console.error("profiles error:", errToPlain(pErr));

        const profileMap = new Map<string, any>();
        (profilesData ?? []).forEach((p: any) => profileMap.set(p.id, p));

        const finalRows: Registration[] = userIds.map((uid: string) => {
          const p = profileMap.get(uid);
          return {
            user_id: uid,
            full_name: p?.full_name ?? null,
            username: p?.username ?? null,
            email: p?.email ?? null,
          };
        });

        setRegistrations(finalRows);
      }

      // 4) load existing results (prefill)
      const { data: rData, error: rErr } = await supabase
        .from("tournament_results")
        .select("tournament_id, user_id, rank, pnl")
        .eq("tournament_id", tournamentId)
        .order("rank", { ascending: true });

      if (rErr) console.error("results load error:", errToPlain(rErr));

      const existing = (rData ?? []) as ResultRow[];

      const wc = (tData?.winners_count ?? 3) as number;
      const maxRanks = Math.max(1, Math.min(10, wc)); // cap 10

      const next: WinnerFormRow[] = [];
      for (let rk = 1; rk <= maxRanks; rk++) {
        const hit = existing.find((x) => x.rank === rk);
        next.push({
          rank: rk,
          user_id: hit?.user_id ?? "",
          pnl: hit?.pnl != null ? String(hit.pnl) : "",
        });
      }
      setWinners(next);

      setLoading(false);
    }

    load();
  }, [tournamentId]);

  async function saveResults() {
    setSaveMsg("");

    const picked = winners.map((w) => w.user_id).filter(Boolean);
    const uniquePicked = new Set(picked);

    if (picked.length === 0) {
      setSaveMsg("Please select at least one winner.");
      return;
    }

    if (uniquePicked.size !== picked.length) {
      setSaveMsg("Same trader cannot be selected for multiple ranks.");
      return;
    }

    for (const w of winners) {
      if (!w.user_id) continue;
      const pnlNum = Number(w.pnl);
      if (w.pnl.trim() === "" || Number.isNaN(pnlNum)) {
        setSaveMsg(`Profit is required (number) for Rank #${w.rank}.`);
        return;
      }
    }

    setSaving(true);

    const payload = winners
  .filter((w) => w.user_id)
  .map((w) => {
    const pnlNumber = Number(w.pnl);

    return {
      tournament_id: tournamentId,
      rank: w.rank,
      user_id: w.user_id,
      pnl: pnlNumber,
      outcome: pnlNumber > 0 ? "win" : "loss", // ✅ الحل الصحيح
    };
  });

    const { data, error } = await supabase
      .from("tournament_results")
      .upsert(payload, { onConflict: "tournament_id,rank" })
      .select("tournament_id, user_id, rank, pnl");

    if (error) {
      const plain = errToPlain(error);
      console.error("save results error raw:", error);
      console.error("save results error details:", plain);
      setSaveMsg(`Error: ${plain.message || plain.code || "Unknown error"}`);
      setSaving(false);
      return;
    }

    // (اختياري) تحديث الفورم من الداتا الراجعة
    if (data && Array.isArray(data)) {
      const maxRanks = winners.length;
      const next = [...winners].map((w) => {
        const hit = (data as any[]).find((x) => x.rank === w.rank);
        return hit
          ? { ...w, user_id: hit.user_id ?? w.user_id, pnl: hit.pnl != null ? String(hit.pnl) : w.pnl }
          : w;
      });
      setWinners(next.slice(0, maxRanks));
    }

    setSaveMsg("✅ Results saved successfully!");
    setSaving(false);
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!tournament) return <div className="p-6">Tournament not found</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Results – {tournament.title}</h1>
        <div className="text-sm text-gray-500">Status: {tournament.status}</div>
      </div>

      {/* Registered traders */}
      <div>
        <div className="font-semibold mb-2">Registered traders:</div>

        {registrations.length === 0 ? (
          <div className="text-sm text-gray-400">No registrations yet.</div>
        ) : (
          <ul className="space-y-1 text-sm">
            {registrations.map((r) => (
              <li key={r.user_id}>• {nameFor(r)}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Publish winners */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="font-semibold">Publish Winners</div>

        <div className="space-y-3">
          {winners.map((w, idx) => (
            <div key={w.rank} className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="w-24 font-bold">Rank #{w.rank}</div>

              <select
                className="border rounded px-3 py-2 text-sm bg-white"
                value={w.user_id}
                onChange={(e) => {
                  const copy = [...winners];
                  copy[idx] = { ...copy[idx], user_id: e.target.value };
                  setWinners(copy);
                }}
              >
                <option value="">Select trader</option>
                {registrations.map((r) => (
                  <option key={r.user_id} value={r.user_id}>
                    {nameFor(r)}
                  </option>
                ))}
              </select>

              <input
                className="border rounded px-3 py-2 text-sm"
                placeholder="Profit (pnl) e.g. 1200"
                value={w.pnl}
                onChange={(e) => {
                  const copy = [...winners];
                  copy[idx] = { ...copy[idx], pnl: e.target.value };
                  setWinners(copy);
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={saveResults}
            disabled={saving}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Results"}
          </button>

          {saveMsg ? <div className="text-sm">{saveMsg}</div> : null}
        </div>

        <div className="text-xs text-gray-500">
          Tip: winners are limited to registered traders for this tournament.
        </div>
      </div>

      {/* Quick preview */}
      <div className="text-sm text-gray-600">
        Preview:{" "}
        {winners
          .filter((w) => w.user_id)
          .map((w) => {
            const r = regMap.get(w.user_id);
            return `#${w.rank} ${r ? nameFor(r) : w.user_id} (+${w.pnl})`;
          })
          .join(" • ") || "—"}
      </div>
    </div>
  );
}