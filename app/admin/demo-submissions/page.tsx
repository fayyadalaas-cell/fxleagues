// app/admin/demo-submissions/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = {
  tournament?: string;
  demo_status?: string; // submitted/approved/rejected/draft
  reg_status?: string;  // pending_review/approved/rejected/joined_pending/...
};

function badge(status: string) {
  const s = (status || "").toLowerCase();
  const base = "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium";

  if (s === "approved") return `${base} bg-green-500/15 text-green-300 ring-1 ring-green-500/30`;
  if (s === "rejected") return `${base} bg-red-500/15 text-red-300 ring-1 ring-red-500/30`;
  if (s === "submitted") return `${base} bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30`;
  if (s === "pending_review") return `${base} bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30`;
  if (s === "joined_pending") return `${base} bg-white/10 text-white/80 ring-1 ring-white/15`;

  return `${base} bg-white/10 text-white/80 ring-1 ring-white/15`;
}

type DemoRow = {
  id: string;
  tournament_id: string;
  user_id: string;
  platform: string | null;
  login: string | null;
  investor_password: string | null;
  server: string | null;
  status: string | null; // demo status
  created_at: string | null;

  tournaments?: { id: string; title: string | null } | null;
  profiles?: {
    id: string;
    email: string | null;
    full_name: string | null;
    username: string | null;
    phone: string | null;
  } | null;

  // added in code:
  reg_status?: string | null;
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function deriveDisplayName(p?: DemoRow["profiles"]) {
  const full = (p?.full_name || "").trim();
  if (full) return full;

  const u = (p?.username || "").trim();
  if (u) return u;

  const e = (p?.email || "").trim();
  if (e && e.includes("@")) return e.split("@")[0];

  if (e) return e;

  return "User";
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};

  const tournamentFilter = typeof sp.tournament === "string" ? sp.tournament : "";
  const demoStatusFilter = typeof sp.demo_status === "string" ? sp.demo_status.toLowerCase() : "";
  const regStatusFilter = typeof sp.reg_status === "string" ? sp.reg_status.toLowerCase() : "";

  const supabase = await createClient();

  // 1) لازم يكون في user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/admin/demo-submissions");

  // 2) Admin check
  const { data: isAdminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!isAdminRow) redirect("/");

  // 3) Load tournaments (dropdown)
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id,title")
    .order("created_at", { ascending: false });

  // 4) Load demo submissions
  let q = supabase
    .from("tournament_credentials")
    .select(
      `
      id,
      tournament_id,
      user_id,
      platform,
      login,
      investor_password,
      server,
      status,
      created_at,
      tournaments:tournament_id ( id, title ),
      profiles:user_id ( id, email, full_name, username, phone )
    `
    )
    .order("created_at", { ascending: false });

  if (tournamentFilter) q = q.eq("tournament_id", tournamentFilter);
  if (demoStatusFilter) q = q.eq("status", demoStatusFilter);

  const { data: demoRows, error: demoErr } = await q;

  let rows: DemoRow[] = (demoRows as any) || [];

  // 5) Pull registration statuses for the same (tournament_id, user_id)
  const uniqueTournamentIds = Array.from(new Set(rows.map((r) => r.tournament_id).filter(Boolean)));
  const uniqueUserIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean)));

  const regMap = new Map<string, string>(); // key = `${tournament_id}:${user_id}` -> status

  if (uniqueTournamentIds.length && uniqueUserIds.length) {
    const { data: regRows } = await supabase
      .from("tournament_registrations")
      .select("tournament_id,user_id,status")
      .in("tournament_id", uniqueTournamentIds)
      .in("user_id", uniqueUserIds);

    (regRows as any[] | null)?.forEach((rr) => {
      const key = `${rr.tournament_id}:${rr.user_id}`;
      regMap.set(key, (rr.status || "").toLowerCase());
    });
  }

  rows = rows.map((r) => {
    const key = `${r.tournament_id}:${r.user_id}`;
    return { ...r, reg_status: regMap.get(key) ?? null };
  });

  // 6) Apply reg_status filter (in memory)
  if (regStatusFilter) {
    rows = rows.filter((r) => (r.reg_status || "").toLowerCase() === regStatusFilter);
  }

  // 7) Stats
  const totalSubmitted = rows.filter((r) => (r.status || "").toLowerCase() === "submitted").length;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="w-full px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Demo Submissions</h1>
            <p className="text-white/60 text-sm mt-1">
              Contact list + demo details for sponsors.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            ← Back to Admin
          </Link>
        </div>

        {/* Stats cards */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-white/60 text-xs">Pending (demo = submitted)</div>
            <div className="text-2xl font-bold mt-1">{totalSubmitted}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-white/60 text-xs">Filters</div>
            <div className="text-sm mt-1 text-white/80">Tournament + Demo status + Registration status</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-white/60 text-xs">Tip</div>
            <div className="text-sm mt-1 text-white/80">
              This page is for sponsor-ready participant data.
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <form className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-xs text-white/60">Tournament</label>
              <select
                name="tournament"
                defaultValue={tournamentFilter}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none"
              >
                <option value="">All tournaments</option>
                {(tournaments || []).map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-56">
              <label className="text-xs text-white/60">Demo status</label>
              <select
                name="demo_status"
                defaultValue={demoStatusFilter}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none"
              >
                <option value="">All</option>
                <option value="submitted">submitted</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
                <option value="draft">draft</option>
              </select>
            </div>

            <div className="w-full md:w-64">
              <label className="text-xs text-white/60">Registration status</label>
              <select
                name="reg_status"
                defaultValue={regStatusFilter}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none"
              >
                <option value="">All</option>
                <option value="joined_pending">joined_pending</option>
                <option value="pending_review">pending_review</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
                <option value="joined">joined</option>
              </select>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
            >
              Apply
            </button>
          </form>
        </div>

        {/* Error */}
        {demoErr && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            Error: {demoErr.message}
          </div>
        )}

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="text-left p-3">Tournament</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">Platform</th>
                <th className="text-left p-3">Login</th>
                <th className="text-left p-3">Server</th>
                <th className="text-left p-3">Demo</th>
                <th className="text-left p-3">Registration</th>
                <th className="text-left p-3">Submitted</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => {
                const tournamentTitle = r.tournaments?.title ?? r.tournament_id;
                const name = deriveDisplayName(r.profiles || undefined);
                const email = (r.profiles?.email || "").trim() || null;
                const phone = (r.profiles?.phone || "").trim() || null;

                return (
                  <tr key={r.id} className="border-t border-white/10">
                    <td className="p-3">
                      <div className="text-white/90">{tournamentTitle}</div>
                      <div className="text-xs text-white/40">{r.tournament_id}</div>
                    </td>

                    <td className="p-3">
                      <div className="text-white/90">{name}</div>
                      <div className="text-xs text-white/40">{r.user_id}</div>
                    </td>

                    <td className="p-3">
                      {email ? (
                        <a className="hover:underline text-white/80" href={`mailto:${email}`}>
                          {email}
                        </a>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>

                    <td className="p-3">
                      {phone ? (
                        <a className="hover:underline text-white/70" href={`tel:${phone}`}>
                          {phone}
                        </a>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>

                    <td className="p-3">{r.platform ?? "—"}</td>
                    <td className="p-3">{r.login ?? "—"}</td>
                    <td className="p-3">{r.server ?? "—"}</td>

                    <td className="p-3">
                      <span className={badge(r.status || "")}>{r.status || "—"}</span>
                    </td>

                    <td className="p-3">
                      <span className={badge(r.reg_status || "")}>{r.reg_status || "—"}</span>
                    </td>

                    <td className="p-3 text-white/70">{fmtDate(r.created_at)}</td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr className="border-t border-white/10">
                  <td className="p-6 text-white/60" colSpan={10}>
                    No submissions found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-white/50">
          Note: Approve/Reject is managed inside each tournament registrations page.
        </div>
      </div>
    </main>
  );
}