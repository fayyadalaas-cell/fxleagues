"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchTournaments, type TournamentDB } from "@/lib/tournaments";
import { supabase } from "@/lib/supabase";

type TournamentRow = {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  prize: number;

  sponsorName: string;

  dateLabel: string; // Feb 17
  startTimeLabel: string; // 7:00 PM
  endTimeLabel: string; // 10:00 PM or —
};

function money(n: number) {
  return `$${Number(n || 0).toLocaleString()}`;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function badgeStatusClass(status: string) {
  const s = (status || "").toUpperCase();
  if (s === "LIVE") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  if (s === "COMPLETED") return "border-zinc-700/50 bg-white/5 text-zinc-300";
  return "border-amber-500/30 bg-amber-500/10 text-amber-200"; // UPCOMING default
}

function computeStatusFromTime(t: TournamentDB) {
  const now = new Date();
  const start = new Date(t.start_date);
  const end = t.end_date ? new Date(t.end_date) : null;

  if (end && now > end) return "COMPLETED";
  if (start <= now && (!end || now <= end)) return "LIVE";
  return "UPCOMING";
}

function toRow(t: TournamentDB): TournamentRow {
  const start = new Date(t.start_date);
  const end = t.end_date ? new Date(t.end_date) : null;

  return {
    id: t.id,
    slug: t.slug ?? t.id,
    title: t.title,
    type: t.type ?? "Daily",
    status: computeStatusFromTime(t),
    prize: t.prize_pool ?? 0,
    sponsorName: t.sponsor_name ?? "FXLeagues",
    dateLabel: fmtDate(start),
    startTimeLabel: fmtTime(start),
    endTimeLabel: end ? fmtTime(end) : "—",
  };
}

export default function SchedulePage() {
  const [rows, setRows] = useState<TournamentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // ✅ join status for current user
  const [userId, setUserId] = useState<string | null>(null);
  const [joinedTournamentIds, setJoinedTournamentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // 1) load tournaments
        const db = await fetchTournaments();
        const mapped = (db ?? []).map(toRow);
        if (alive) setRows(mapped);

        // 2) load current session user
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id ?? null;
        if (!alive) return;

        setUserId(uid);

        // 3) if logged in -> load joined registrations
        if (uid) {
          const { data: regs, error: regsErr } = await supabase
            .from("tournament_registrations")
            .select("tournament_id")
            .eq("user_id", uid);

          if (!regsErr && regs) {
            setJoinedTournamentIds(new Set(regs.map((r: any) => r.tournament_id)));
          }
        } else {
          setJoinedTournamentIds(new Set());
        }
      } catch (e: any) {
        if (alive) setErr(e?.message || "Failed to load tournaments.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const tournaments = useMemo(() => rows, [rows]);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Schedule</h1>
            <p className="mt-2 text-sm sm:text-base text-zinc-400">
              Upcoming demo tournaments (times shown in your local timezone).
            </p>
          </div>

          <Link
            href="/leaderboards"
            className="w-full sm:w-auto text-center rounded-lg border border-zinc-700/70 px-4 py-2 text-sm text-zinc-200 hover:bg-white/[0.04]"
          >
            View leaderboards
          </Link>
        </div>

        {/* States */}
        {loading && (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
            Loading tournaments…
          </div>
        )}

        {err && (
          <div className="mt-6 rounded-2xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-200">
            {err}
          </div>
        )}

        {!loading && !err && tournaments.length === 0 && (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
            No tournaments found in database.
          </div>
        )}

        {/* ✅ MOBILE (Cards) */}
        {!loading && !err && tournaments.length > 0 && (
          <div className="mt-6 grid gap-3 sm:hidden">
            {tournaments.map((t) => {
              const isJoined = joinedTournamentIds.has(t.id);

              return (
                <div key={t.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/tournaments/${t.slug}`}
                        className="block truncate text-base font-semibold hover:underline"
                      >
                        {t.title}
                      </Link>
                      <div className="mt-1 text-xs text-zinc-400">
                        {t.dateLabel} • {t.startTimeLabel} → {t.endTimeLabel}
                      </div>
                    </div>

                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] ${badgeStatusClass(t.status)}`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-zinc-200">{t.sponsorName}</div>
                      <div className="text-[11px] text-zinc-400">{t.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-yellow-400">{money(t.prize)}</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      href={`/tournaments/${t.slug}`}
                      className="rounded-lg border border-zinc-700/70 px-3 py-2 text-center text-sm text-zinc-200 hover:bg-white/[0.04]"
                    >
                      Details
                    </Link>

                    {isJoined ? (
                      <button
                        disabled
                        className="rounded-lg bg-zinc-700 px-3 py-2 text-center text-sm font-semibold text-zinc-300 cursor-not-allowed"
                        title="Already joined"
                      >
                        Joined
                      </button>
                    ) : (
                      <Link
                        href={`/tournaments/${t.slug}/join`}
                        className="rounded-lg bg-yellow-500 px-3 py-2 text-center text-sm font-semibold text-black hover:bg-yellow-400"
                      >
                        Join
                      </Link>
                    )}
                  </div>

                  {!userId && (
                    <div className="mt-2 text-[11px] text-zinc-500">
                      Sign in to track joined status.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ✅ DESKTOP/TABLET (Table) */}
        {!loading && !err && tournaments.length > 0 && (
          <div className="mt-8 hidden sm:block overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="grid grid-cols-12 border-b border-zinc-800 px-4 py-3 text-xs text-zinc-400">
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Start</div>
              <div className="col-span-2">End</div>
              <div className="col-span-2">Tournament</div>
              <div className="col-span-1">Partner</div>
              <div className="col-span-1 text-right">Prize</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            <div className="divide-y divide-zinc-800">
              {tournaments.map((t) => {
                const isJoined = joinedTournamentIds.has(t.id);

                return (
                  <div key={t.id} className="grid grid-cols-12 items-center px-4 py-4">
                    <div className="col-span-2 text-sm font-semibold">{t.dateLabel}</div>

                    <div className="col-span-2 text-sm text-zinc-200">{t.startTimeLabel}</div>

                    <div className="col-span-2 text-sm text-zinc-200">{t.endTimeLabel}</div>

                    <div className="col-span-2">
                      <Link href={`/tournaments/${t.slug}`} className="text-sm font-semibold hover:underline">
                        {t.title}
                      </Link>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`rounded-full border px-2 py-1 text-[11px] ${badgeStatusClass(t.status)}`}>
                          {t.status}
                        </span>
                        <span className="rounded-full border border-zinc-700/70 px-2 py-1 text-[11px] text-zinc-200">
                          {t.type}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-1">
                      <div className="text-sm font-semibold text-zinc-200">{t.sponsorName}</div>
                    </div>

                    <div className="col-span-1 text-right font-semibold text-yellow-400">
                      {money(t.prize)}
                    </div>

                    <div className="col-span-2 flex justify-end gap-2">
                      <Link
                        href={`/tournaments/${t.slug}`}
                        className="rounded-lg border border-zinc-700/70 px-3 py-2 text-xs text-zinc-200 hover:bg-white/[0.04]"
                      >
                        Details
                      </Link>

                      {isJoined ? (
                        <button
                          disabled
                          className="rounded-lg bg-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 cursor-not-allowed"
                          title="Already joined"
                        >
                          Joined
                        </button>
                      ) : (
                        <Link
                          href={`/tournaments/${t.slug}/join`}
                          className="rounded-lg bg-yellow-500 px-3 py-2 text-xs font-semibold text-black hover:bg-yellow-400"
                        >
                          Join
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-4 py-3 text-xs text-zinc-500">
              Mobile view uses cards for better readability.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}