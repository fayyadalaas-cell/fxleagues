"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchTournaments, type TournamentDB } from "@/lib/tournaments";
import { supabase } from "@/lib/supabase/client";

type Status = "LIVE" | "UPCOMING" | "ENDED";
type Filter = "ALL" | "LIVE" | "UPCOMING" | "ENDED";

const REGISTRATION_OPEN = false;

type TournamentRow = {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: Status;
  prize: number;
  sponsorName: string;

  startDateLabel: string;
  startTimeLabel: string;
  endDateLabel: string;
  endTimeLabel: string;

  // for sorting
  startTs: number;
  endTs: number | null;
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

function badgeStatusClass(status: Status) {
  if (status === "LIVE")
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  if (status === "ENDED")
    return "border-zinc-700/50 bg-white/5 text-zinc-300";
  return "border-amber-500/30 bg-amber-500/10 text-amber-200"; // UPCOMING
}

function computeStatusFromTime(t: TournamentDB): Status {
  const now = new Date();
  const start = new Date(t.start_date);
  const end = t.end_date ? new Date(t.end_date) : null;

  // ✅ إذا DB status = CLOSED اعتبرها منتهية فورًا
  const dbStatus = String((t as any).status || "").toUpperCase();
  if (dbStatus === "CLOSED") return "ENDED";

  if (end && now > end) return "ENDED";
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

    startDateLabel: fmtDate(start),
    startTimeLabel: fmtTime(start),
    endDateLabel: end ? fmtDate(end) : "—",
    endTimeLabel: end ? fmtTime(end) : "—",

    startTs: start.getTime(),
    endTs: end ? end.getTime() : null,
  };
}

function statusRank(s: Status) {
  if (s === "LIVE") return 0;
  if (s === "UPCOMING") return 1;
  return 2; // ENDED
}

export default function SchedulePage() {
  const [rows, setRows] = useState<TournamentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [joinedTournamentIds, setJoinedTournamentIds] = useState<Set<string>>(
    new Set()
  );

  // ✅ filters
  const [filter, setFilter] = useState<Filter>("ALL");

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
        const {
          data: { session },
        } = await supabase.auth.getSession();
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
            setJoinedTournamentIds(
              new Set(regs.map((r: any) => r.tournament_id))
            );
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

  // counts for tabs
  const counts = useMemo(() => {
    const c = { ALL: rows.length, LIVE: 0, UPCOMING: 0, ENDED: 0 };
    for (const r of rows) {
      if (r.status === "LIVE") c.LIVE++;
      else if (r.status === "UPCOMING") c.UPCOMING++;
      else c.ENDED++;
    }
    return c;
  }, [rows]);

  // ✅ sort: LIVE first, UPCOMING next, ENDED last
  const sorted = useMemo(() => {
    const copy = [...rows];

    copy.sort((a, b) => {
      const ra = statusRank(a.status);
      const rb = statusRank(b.status);
      if (ra !== rb) return ra - rb;

      // within each group:
      if (a.status === "ENDED" && b.status === "ENDED") {
        // most recently ended first (still at bottom group)
        const ae = a.endTs ?? a.startTs;
        const be = b.endTs ?? b.startTs;
        return be - ae;
      }

      // LIVE + UPCOMING: earliest first (so next events appear first)
      return a.startTs - b.startTs;
    });

    return copy;
  }, [rows]);

  // ✅ apply filter
  const filtered = useMemo(() => {
    if (filter === "ALL") return sorted;
    return sorted.filter((t) => t.status === filter);
  }, [sorted, filter]);

  // ✅ limit to 20
  const visible = useMemo(() => filtered.slice(0, 20), [filtered]);

  const showLimitNote = !loading && !err && filtered.length > 20;

  const Tab = ({
    id,
    label,
    count,
  }: {
    id: Filter;
    label: string;
    count: number;
  }) => {
    const active = filter === id;
    return (
      <button
        onClick={() => setFilter(id)}
        className={
          "rounded-full border px-3 py-1.5 text-xs font-semibold transition " +
          (active
            ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-100"
            : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-white/[0.04]")
        }
      >
        {label}{" "}
        <span className="ml-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-200">
          {count}
        </span>
      </button>
    );
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Schedule</h1>
            <p className="mt-2 text-sm sm:text-base text-zinc-400">
              Demo tournaments (times shown in your local timezone).
            </p>
          </div>

          <Link
            href="/leaderboards"
            className="w-full sm:w-auto text-center rounded-lg border border-zinc-700/70 px-4 py-2 text-sm text-zinc-200 hover:bg-white/[0.04]"
          >
            View leaderboards
          </Link>
        </div>

        {/* Tabs */}
        {!loading && !err && rows.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Tab id="ALL" label="All" count={counts.ALL} />
            <Tab id="LIVE" label="Live" count={counts.LIVE} />
            <Tab id="UPCOMING" label="Open" count={counts.UPCOMING} />
            <Tab id="ENDED" label="Ended" count={counts.ENDED} />

            <div className="ml-auto text-xs text-zinc-500">
              Showing <span className="text-zinc-200">{visible.length}</span> of{" "}
              <span className="text-zinc-200">{filtered.length}</span>
            </div>
          </div>
        )}

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

        {!loading && !err && rows.length === 0 && (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
            No tournaments found in database.
          </div>
        )}

        {showLimitNote && (
          <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
            Showing only the first <b>20</b> tournaments for performance. Use the
            tabs to narrow down results.
          </div>
        )}

        {/* ✅ MOBILE (Cards) */}
        {!loading && !err && visible.length > 0 && (
          <div className="mt-6 grid gap-3 sm:hidden">
            {visible.map((t) => {
              const isJoined = joinedTournamentIds.has(t.id);
              const isEnded = t.status === "ENDED";

              return (
                <div
                  key={t.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/tournaments/${t.slug}`}
                        className="block truncate text-base font-semibold hover:underline"
                      >
                        {t.title}
                      </Link>

                      <div className="mt-1 text-xs text-zinc-400">
                        Start: {t.startDateLabel} • {t.startTimeLabel}
                        <br />
                        End: {t.endDateLabel} • {t.endTimeLabel}
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2 py-1 text-[11px] ${badgeStatusClass(
                        t.status
                      )}`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-zinc-200">
                        {t.sponsorName}
                      </div>
                      <div className="text-[11px] text-zinc-400">{t.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-yellow-400">
                        {money(t.prize)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      href={`/tournaments/${t.slug}`}
                      className="rounded-lg border border-zinc-700/70 px-3 py-2 text-center text-sm text-zinc-200 hover:bg-white/[0.04]"
                    >
                      Details
                    </Link>

                    {isEnded ? (
  <button
    disabled
    className="rounded-lg bg-zinc-800 px-3 py-2 text-center text-sm font-semibold text-zinc-400 cursor-not-allowed"
    title="Tournament ended"
  >
    Ended
  </button>
) : isJoined ? (
  <button
    disabled
    className="rounded-lg bg-zinc-700 px-3 py-2 text-center text-sm font-semibold text-zinc-300 cursor-not-allowed"
    title="Already joined"
  >
    Joined
  </button>
) : (
  <button
    disabled
    className="rounded-lg bg-zinc-700 px-3 py-2 text-center text-sm font-semibold text-zinc-300 cursor-not-allowed"
    title="Registrations closed for now"
  >
    Soon
  </button>
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
        {!loading && !err && visible.length > 0 && (
          <div className="mt-8 hidden sm:block overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="grid grid-cols-12 border-b border-zinc-800 px-4 py-3 text-xs text-zinc-400">
              <div className="col-span-2">Start</div>
              <div className="col-span-2">End</div>
              <div className="col-span-3">Tournament</div>
              <div className="col-span-2">Partner</div>
              <div className="col-span-1 text-right">Prize</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            <div className="divide-y divide-zinc-800">
              {visible.map((t) => {
                const isJoined = joinedTournamentIds.has(t.id);
                const isEnded = t.status === "ENDED";

                return (
                  <div
                    key={t.id}
                    className="grid grid-cols-12 items-center px-4 py-4"
                  >
                    {/* Start */}
                    <div className="col-span-2">
                      <div className="text-sm font-semibold">
                        {t.startDateLabel}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {t.startTimeLabel}
                      </div>
                    </div>

                    {/* End */}
                    <div className="col-span-2">
                      <div className="text-sm font-semibold">{t.endDateLabel}</div>
                      <div className="text-xs text-zinc-400">{t.endTimeLabel}</div>
                    </div>

                    {/* Tournament */}
                    <div className="col-span-3">
                      <Link
                        href={`/tournaments/${t.slug}`}
                        className="text-sm font-semibold hover:underline"
                      >
                        {t.title}
                      </Link>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-1 text-[11px] ${badgeStatusClass(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>
                        <span className="rounded-full border border-zinc-700/70 px-2 py-1 text-[11px] text-zinc-200">
                          {t.type}
                        </span>
                      </div>
                    </div>

                    {/* Partner */}
                    <div className="col-span-2">
                      <div className="text-sm font-semibold text-zinc-200">
                        {t.sponsorName}
                      </div>
                    </div>

                    {/* Prize */}
                    <div className="col-span-1 text-right font-semibold text-yellow-400">
                      {money(t.prize)}
                    </div>

                    {/* Action */}
                    <div className="col-span-2 flex justify-end gap-2">
                      <Link
                        href={`/tournaments/${t.slug}`}
                        className="rounded-lg border border-zinc-700/70 px-3 py-2 text-xs text-zinc-200 hover:bg-white/[0.04]"
                      >
                        Details
                      </Link>

                      {isEnded ? (
  <button
    disabled
    className="rounded-lg bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-400 cursor-not-allowed"
    title="Tournament ended"
  >
    Ended
  </button>
) : isJoined ? (
  <button
    disabled
    className="rounded-lg bg-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 cursor-not-allowed"
    title="Already joined"
  >
    Joined
  </button>
) : (
  <button
    disabled
    className="rounded-lg bg-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 cursor-not-allowed"
    title="Registrations closed for now"
  >
    Soon
  </button>
)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-4 py-3 text-xs text-zinc-500">
              Showing up to 20 tournaments. Use filters to narrow down.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}