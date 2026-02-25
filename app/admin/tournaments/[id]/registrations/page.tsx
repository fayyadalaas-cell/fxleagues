// app/admin/tournaments/[id]/registrations/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type Row = {
  registration_id: string;
  tournament_id: string;
  user_id: string | null;
  status: string | null;
  details_submitted: boolean | null;
  registered_at: string | null;
  full_name: string | null;
  email: string | null;
  platform: string | null;
  login: string | null;
  server: string | null;
  investor_password: string | null;
};

type CredRow = {
  user_id: string;
  platform: string | null;
  login: string | null;
  investor_password: string | null;
  server: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString();
}

function buildQueryString(params: Record<string, string | number | undefined | null>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
}

async function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });
}

/** ✅ Approve: فقط بعد pending_review */
async function approveRegistrationAction(formData: FormData) {
  "use server";

  const registrationId = String(formData.get("registration_id") || "");
  const tournamentId = String(formData.get("tournament_id") || "");

  const back = `/admin/tournaments/${tournamentId}/registrations`;

  if (!registrationId || !tournamentId) redirect(`${back}?msg=missing_id`);

  const supabase = await getSupabase();

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) redirect(`${back}?msg=login_required`);

  const { error } = await supabase
    .from("tournament_registrations")
    .update({
      status: "approved",
      admin_decision: "APPROVED",
      decided_at: new Date().toISOString(),
      decided_by: userRes.user.id,
    })
    .eq("id", registrationId)
    

  if (error) redirect(`${back}?msg=approve_failed`);

  revalidatePath(back);
  redirect(`${back}?msg=approved`);
}

/** ❌ Reject */
async function rejectRegistrationAction(formData: FormData) {
  "use server";

  const registrationId = String(formData.get("registration_id") || "");
  const tournamentId = String(formData.get("tournament_id") || "");

  const back = `/admin/tournaments/${tournamentId}/registrations`;

  if (!registrationId || !tournamentId) redirect(`${back}?msg=missing_id`);

  const supabase = await getSupabase();

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) redirect(`${back}?msg=login_required`);

  const { error } = await supabase
    .from("tournament_registrations")
    .update({
      status: "rejected",
      admin_decision: "REJECTED",
      decided_at: new Date().toISOString(),
      decided_by: userRes.user.id,
    })
    .eq("id", registrationId)
    .eq("status", "pending_review");

  if (error) redirect(`${back}?msg=reject_failed`);

  revalidatePath(back);
  redirect(`${back}?msg=rejected`);
}

export default async function AdminTournamentRegistrationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: tournamentId } = await params;
  const sp = (await searchParams) || {};

  const qRaw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const statusRaw = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const msgRaw = Array.isArray(sp.msg) ? sp.msg[0] : sp.msg;

  const q = (qRaw || "").trim();
  const status = (statusRaw || "all").trim();
  const page = Math.max(1, parseInt(pageRaw || "1", 10) || 1);

  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const backUrl = `/admin/tournaments/${tournamentId}/registrations${buildQueryString({ q, status, page })}`;

  let supabase;
  try {
    supabase = await getSupabase();
  } catch (e: any) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-2xl font-semibold">Registrations</h1>
          <p className="mt-3 text-zinc-400">{e?.message || "Missing env vars"}</p>
          <div className="mt-6">
            <Link className="text-yellow-400 hover:underline" href={`/admin/tournaments`}>
              ← Back to Tournaments
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Tournament title (optional nice header)
  const { data: tData } = await supabase.from("tournaments").select("title").eq("id", tournamentId).single();
  const tournamentTitle = (tData as any)?.title ?? tournamentId;

  // Count
  let countQuery = supabase
    .from("admin_tournament_registrants")
    .select("registration_id", { count: "exact", head: true })
    .eq("tournament_id", tournamentId);

  if (status !== "all") countQuery = countQuery.eq("status", status);

  if (q) {
    const escaped = q.replace(/"/g, '\\"');
    countQuery = countQuery.or(`full_name.ilike."%${escaped}%",email.ilike."%${escaped}%"`);
  }

  const { count: totalCount } = await countQuery;

  // Data
  let dataQuery = supabase
    .from("admin_tournament_registrants")
    .select("registration_id,tournament_id,user_id,status,details_submitted,registered_at,full_name,email,platform,login,server,investor_password")
    .eq("tournament_id", tournamentId)
    .order("registered_at", { ascending: false })
    .range(from, to);

  if (status !== "all") dataQuery = dataQuery.eq("status", status);

  if (q) {
    const escaped = q.replace(/"/g, '\\"');
    dataQuery = dataQuery.or(`full_name.ilike."%${escaped}%",email.ilike."%${escaped}%"`);
  }

  const { data, error } = await dataQuery;

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-2xl font-semibold">Registrations</h1>
          <pre className="mt-3 rounded-2xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-200 overflow-auto">
            {error.message}
          </pre>
        </div>
      </main>
    );
  }

  const rows = (data || []) as Row[];
// ---- Credentials (demo accounts) ----
const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean))) as string[];

const credsByUserId = new Map<string, CredRow>();

if (userIds.length) {
  const { data: credData, error: credErr } = await supabase
    .from("tournament_credentials")
    .select("user_id,platform,login,investor_password,server")
    .eq("tournament_id", tournamentId)
    .in("user_id", userIds);

  if (!credErr) {
    (credData as CredRow[] | null)?.forEach((c) => {
      if (c?.user_id) credsByUserId.set(c.user_id, c);
    });
  }
}

  const total = totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const baseParams = { q, status };
  const prevHref = page > 1 ? `/admin/tournaments/${tournamentId}/registrations${buildQueryString({ ...baseParams, page: page - 1 })}` : null;
  const nextHref = page < totalPages ? `/admin/tournaments/${tournamentId}/registrations${buildQueryString({ ...baseParams, page: page + 1 })}` : null;

  const msg =
    msgRaw === "approved"
      ? "✅ Approved"
      : msgRaw === "rejected"
      ? "✅ Rejected"
      : msgRaw === "approve_failed"
      ? "❌ Approve failed"
      : msgRaw === "reject_failed"
      ? "❌ Reject failed"
      : msgRaw === "login_required"
      ? "⚠️ لازم تكون مسجّل دخول عشان تعمل Approve/Reject"
      : msgRaw === "missing_id"
      ? "⚠️ Missing registration id"
      : null;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/admin/tournaments" className="text-yellow-400 hover:underline text-sm">
              ← Back to Tournaments
            </Link>

            <h1 className="text-3xl font-bold mt-3">Registrations</h1>
            <p className="mt-2 text-zinc-400">
              Tournament: <span className="text-white">{tournamentTitle}</span>
            </p>

            <p className="mt-1 text-zinc-500 text-sm">
              Showing {Math.min(from + 1, total)}–{Math.min(to + 1, total)} of {total}.
            </p>

            {msg ? (
              <div className="mt-3 inline-flex rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200">
                {msg}
              </div>
            ) : null}
          </div>

          <Link
            href={`/admin/tournaments/${tournamentId}/edit`}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm hover:bg-zinc-900"
          >
            Edit Tournament
          </Link>
        </div>

        {/* Controls */}
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <form method="GET" className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400">Search</label>
              <input
                name="q"
                defaultValue={q}
                placeholder="Name or email..."
                className="w-[260px] rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400">Status</label>
              <select
                name="status"
                defaultValue={status}
                className="w-[220px] rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none text-white"
              >
                <option value="all">All</option>
                <option value="joined_pending">joined_pending</option>
                <option value="pending_review">pending_review</option>
                <option value="joined">joined</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
              </select>
            </div>

            <button className="rounded-xl bg-yellow-500 text-black px-4 py-2 text-sm font-semibold hover:bg-yellow-400">
              Apply
            </button>

            <Link
              href={`/admin/tournaments/${tournamentId}/registrations`}
              className="rounded-xl border border-zinc-800 bg-transparent px-4 py-2 text-sm hover:bg-zinc-900"
            >
              Reset
            </Link>
          </form>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="overflow-auto">
            <table className="min-w-[1400px] w-full text-left text-sm">
              <thead className="bg-zinc-900 text-zinc-200">
                <tr>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Login</th>
                  <th className="px-4 py-3">Server</th>
                  <th className="px-4 py-3">Investor PW</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-zinc-400" colSpan={11}>
                      No registrations found.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const isPendingReview = (r.status || "").toLowerCase() === "pending_review";
                    const canDecide = isPendingReview && r.details_submitted === true;
                    const cred = r.user_id ? credsByUserId.get(r.user_id) : null;

                    return (
                      <tr key={r.registration_id} className="hover:bg-zinc-900/40">
                        <td className="px-4 py-3 text-zinc-300">{formatDate(r.registered_at)}</td>
                        <td className="px-4 py-3 text-zinc-200">{r.full_name || "—"}</td>
                        <td className="px-4 py-3 text-zinc-300">{r.email || "—"}</td>

                        <td className="px-4 py-3 text-zinc-300">{r.status || "—"}</td>
                        <td className="px-4 py-3 text-zinc-300">{r.details_submitted ? "✅ Yes" : "—"}</td>

                        <td className="px-4 py-3 text-zinc-300">{cred?.platform ?? "—"}</td>
                        <td className="px-4 py-3 text-zinc-300">{cred?.login ?? "—"}</td>
                        <td className="px-4 py-3 text-zinc-300">{cred?.server ?? "—"}</td>
                        <td className="px-4 py-3 text-zinc-300">{cred?.investor_password ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{r.user_id || "—"}</td>


                        <td className="px-4 py-3">
                          {canDecide ? (
                            <div className="flex items-center gap-2">
                              <form action={approveRegistrationAction}>
                                <input type="hidden" name="registration_id" value={r.registration_id} />
                                <input type="hidden" name="tournament_id" value={tournamentId} />
                                <button className="rounded-xl bg-yellow-500 text-black px-3 py-1.5 text-xs font-semibold hover:bg-yellow-400">
                                  Approve
                                </button>
                              </form>

                              <form action={rejectRegistrationAction}>
                                <input type="hidden" name="registration_id" value={r.registration_id} />
                                <input type="hidden" name="tournament_id" value={tournamentId} />
                                <button className="rounded-xl border border-red-900/60 bg-red-950/30 px-3 py-1.5 text-xs text-red-200 hover:bg-red-950/50">
                                  Reject
                                </button>
                              </form>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-500">
                              {(r.status || "").toLowerCase() === "pending_review" ? "Waiting details ✓" : "—"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-950 px-4 py-3">
            <div className="text-xs text-zinc-500">
              Page {page} / {totalPages}
            </div>

            <div className="flex items-center gap-2">
              {prevHref ? (
                <Link href={prevHref} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs hover:bg-zinc-800">
                  ← Prev
                </Link>
              ) : (
                <span className="rounded-xl border border-zinc-900 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-600">← Prev</span>
              )}

              {nextHref ? (
                <Link href={nextHref} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs hover:bg-zinc-800">
                  Next →
                </Link>
              ) : (
                <span className="rounded-xl border border-zinc-900 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-600">Next →</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}