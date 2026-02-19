"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchTournaments, type TournamentDB } from "@/lib/tournaments";

type Row = {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  sponsorName: string;
  startDate: Date;
  endDate: Date | null;
  dateLabel: string;
  timeLabel: string; // 7:00 PM
  prize: number;
};

type Props = {
  title?: string;
  limit?: number;
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
  return "border-amber-500/30 bg-amber-500/10 text-amber-200";
}

function computeStatus(t: TournamentDB) {
  const now = new Date();
  const start = new Date(t.start_date);
  const end = t.end_date ? new Date(t.end_date) : null;

  // 1) إذا انتهى وقت المسابقة (end_date موجود) => COMPLETED
  if (end && now > end) return "COMPLETED";

  // 2) إذا بدأ وقتها ولسه ما انتهت => LIVE
  if (start <= now && (!end || now <= end)) return "LIVE";

  // 3) غير هيك => UPCOMING
  return "UPCOMING";
}


function toRow(t: TournamentDB): Row {
  const start = new Date(t.start_date);
  const end = t.end_date ? new Date(t.end_date) : null;

  return {
    id: t.id,
    slug: t.slug ?? t.id,
    title: t.title,
    type: t.type ?? "Daily",
status: computeStatus(t),
    sponsorName: t.sponsor_name ?? "FXLeagues",
    startDate: start,
    endDate: end,
    dateLabel: fmtDate(start),
    timeLabel: fmtTime(start),
    prize: t.prize_pool ?? 0,
  };
}

export default function Next7DaysFromDb({
  title = "Next 7 Days",
  limit = 7,
}: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const db = await fetchTournaments();
        const mapped = (db ?? []).map(toRow);

        if (!alive) return;
        setRows(mapped);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ أقرب (limit) مسابقات قادمة خلال 30 يوم + LIVE الحقيقي
  const topN = useMemo(() => {
    const now = new Date();
    const WINDOW_DAYS = 30;
    const windowEnd = new Date(now.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);

    return rows
      .filter((r) => r.status !== "COMPLETED")
      .filter((r) => {
        if (r.status === "LIVE") return true;
        return r.startDate >= now && r.startDate <= windowEnd;
      })
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, limit);
  }, [rows, limit]);

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>

        <Link href="/schedule" className="text-sm text-yellow-400 hover:underline">
          View full schedule →
        </Link>
      </div>

      {loading && (
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
          Loading…
        </div>
      )}

      {!loading && topN.length === 0 && (
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
          No upcoming tournaments.
        </div>
      )}

      {!loading && topN.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          {/* ✅ مهم: مجموع الأعمدة = 12 */}
          <div className="grid grid-cols-12 border-b border-zinc-800 px-4 py-3 text-xs text-zinc-400">
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Time</div>
            <div className="col-span-4">Tournament</div>
            <div className="col-span-1">Partner</div>
            <div className="col-span-1 text-right">Prize</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          <div className="divide-y divide-zinc-800">
            {topN.map((t) => (
              <div
                key={t.id}
                className={`grid grid-cols-12 items-center px-4 py-4 ${
                  t.status === "LIVE" ? "bg-emerald-500/10" : ""
                }`}
              >
                <div className="col-span-2 text-sm font-semibold">{t.dateLabel}</div>
                <div className="col-span-2 text-sm text-zinc-200">{t.timeLabel}</div>

                <div className="col-span-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/tournaments/${t.slug}`}
                      className="text-sm font-semibold hover:underline"
                    >
                      {t.title}
                    </Link>

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

                <div className="col-span-1 text-sm font-semibold text-zinc-200 truncate">
                  {t.sponsorName}
                </div>

                <div className="col-span-1 text-right font-semibold text-yellow-400">
                  {money(t.prize)}
                </div>

                <div className="col-span-2 flex justify-end gap-2">
                  <Link
                    href={`/tournaments/${t.slug}`}
                    className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
                  >
                    Details
                  </Link>

                  <Link
                    href={`/tournaments/${t.slug}/join`}
                    className="rounded-lg bg-yellow-500 px-4 py-2 text-xs font-semibold text-black hover:bg-yellow-400"
                  >
                    Join
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 text-xs text-zinc-500">
            Tip: LIVE events are highlighted for faster scanning.
          </div>
        </div>
      )}
    </section>
  );
}
