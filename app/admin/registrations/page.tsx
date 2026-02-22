// app/admin/registrations/page.tsx
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
};

type TournamentRow = {
  id: string;
  title: string | null;
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
  const back = String(formData.get("back") || "/admin/registrations");

  if (!registrationId) redirect(`${back}${back.includes("?") ? "&" : "?"}msg=missing_id`);

  const supabase = await getSupabase();

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) redirect(`${back}${back.includes("?") ? "&" : "?"}msg=login_required`);

  // ✅ تحديث مصدر الحقيقة: tournament_registrations
  const { error } = await supabase
    .from("tournament_registrations")
    .update({
      status: "approved",
      admin_decision: "APPROVED",
      decided_at: new Date().toISOString(),
      decided_by: userRes.user.id,
    })
    .eq("id", registrationId)
    .eq("status", "pending_review"); // مهم: ما يوافق إلا من pending_review

  if (error) redirect(`${back}${back.includes("?") ? "&" : "?"}msg=approve_failed`);

  revalidatePath("/admin/registrations");
  redirect(`${back}${back.includes("?") ? "&" : "?"}msg=approved`);
}

/** ❌ Reject: اختياري */
async function rejectRegistrationAction(formData: FormData) {
  "use server";

  const registrationId = String(formData.get("registration_id") || "");
  const back = String(formData.get("back") || "/admin/registrations");

  if (!registrationId) redirect(`${back}${back.includes("?") ? "&" : "?"}msg=missing_id`);

  const supabase = await getSupabase();

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) redirect(`${back}${back.includes("?") ? "&" : "?"}msg=login_required`);

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

  if (error) redirect(`${back}${back.includes("?") ? "&" : "?"}msg=reject_failed`);

  revalidatePath("/admin/registrations");
  redirect(`${back}${back.includes("?") ? "&" : "?"}msg=rejected`);
}

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
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

  let supabase;
  try {
    supabase = await getSupabase();
  } catch (e: any) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-black">
        <h1 className="text-3xl font-semibold">Registrations</h1>
        <p className="mt-3 text-black/70">{e?.message || "Missing env vars"}</p>
        <div className="mt-6">
          <Link className="text-blue-700 hover:underline" href="/admin">
            ← Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  // Count
  let countQuery = supabase
    .from("admin_tournament_registrants")
    .select("registration_id", { count: "exact", head: true });

  if (status !== "all") countQuery = countQuery.eq("status", status);

  if (q) {
    const escaped = q.replace(/"/g, '\\"');
    countQuery = countQuery.or(`full_name.ilike."%${escaped}%",email.ilike."%${escaped}%"`);
  }

  const { count: totalCount } = await countQuery;

  // Data
  let dataQuery = supabase
    .from("admin_tournament_registrants")
    .select("registration_id,tournament_id,user_id,status,details_submitted,registered_at,full_name,email")
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
      <div className="mx-auto max-w-6xl px-4 py-10 text-black">
        <h1 className="text-3xl font-semibold">Registrations</h1>
        <pre className="mt-3 rounded-xl bg-black/5 p-4 text-sm text-red-700 overflow-auto">
          {error.message}
        </pre>
      </div>
    );
  }

  const rows = (data || []) as Row[];

  // Tournament titles
  const uniqueTournamentIds = Array.from(new Set(rows.map((r) => r.tournament_id).filter(Boolean)));
  const titleById = new Map<string, string>();

  if (uniqueTournamentIds.length) {
    const { data: tours } = await supabase.from("tournaments").select("id,title").in("id", uniqueTournamentIds);
    (tours as TournamentRow[] | null)?.forEach((t) => titleById.set(t.id, t.title || t.id));
  }

  const total = totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const baseParams = { q, status };
  const prevHref = page > 1 ? `/admin/registrations${buildQueryString({ ...baseParams, page: page - 1 })}` : null;
  const nextHref = page < totalPages ? `/admin/registrations${buildQueryString({ ...baseParams, page: page + 1 })}` : null;

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

  const backUrl = `/admin/registrations${buildQueryString({ ...baseParams, page })}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-black">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Registrations</h1>
          <p className="mt-1 text-black/70">
            Showing {Math.min(from + 1, total)}–{Math.min(to + 1, total)} of {total}.
          </p>
          {msg ? (
            <div className="mt-3 inline-flex rounded-xl border border-black/10 bg-black/5 px-3 py-2 text-sm">
              {msg}
            </div>
          ) : null}
        </div>

        <Link href="/admin" className="rounded-xl border border-black/10 bg-black/5 px-4 py-2 text-sm hover:bg-black/10">
          Back to Admin
        </Link>
      </div>

      {/* Controls */}
      <div className="mt-6 rounded-2xl border border-black/10 bg-black/5 p-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-black/70">Search</label>
            <input
              name="q"
              defaultValue={q}
              placeholder="Name or email..."
              className="w-[260px] rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-black/70">Status</label>
            <select
              name="status"
              defaultValue={status}
              className="w-[220px] rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="all">All</option>
              <option value="joined_pending">joined_pending</option>
              <option value="pending_review">pending_review</option>
              <option value="joined">joined</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
            </select>
          </div>

          <button className="rounded-xl border border-black/15 bg-white px-4 py-2 text-sm hover:bg-black/5">Apply</button>
          <Link href="/admin/registrations" className="rounded-xl border border-black/10 bg-transparent px-4 py-2 text-sm hover:bg-black/5">
            Reset
          </Link>
        </form>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white">
        <div className="overflow-auto">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-gray-200 text-black">
              <tr>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Tournament</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-300">
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-black/70" colSpan={8}>
                    No registrations found.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const tTitle = titleById.get(r.tournament_id) || r.tournament_id;

                  const isPendingReview = (r.status || "").toLowerCase() === "pending_review";
                  const canDecide = isPendingReview && r.details_submitted === true; // ✅ شرطك الرئيسي

                  return (
                    <tr key={r.registration_id} className="hover:bg-black/5">
                      <td className="px-4 py-3 text-black/80">{formatDate(r.registered_at)}</td>
                      <td className="px-4 py-3 text-black/80">{r.full_name || "—"}</td>
                      <td className="px-4 py-3 text-black/80">{r.email || "—"}</td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-black/90">{tTitle}</div>
                        <div className="text-xs text-black/50">{r.tournament_id}</div>
                      </td>

                      <td className="px-4 py-3 text-black/80">{r.status || "—"}</td>
                      <td className="px-4 py-3 text-black/80">{r.details_submitted ? "✅ Yes" : "—"}</td>
                      <td className="px-4 py-3 text-xs text-black/50">{r.user_id || "—"}</td>

                      <td className="px-4 py-3">
                        {canDecide ? (
                          <div className="flex items-center gap-2">
                            <form action={approveRegistrationAction}>
                              <input type="hidden" name="registration_id" value={r.registration_id} />
                              <input type="hidden" name="back" value={backUrl} />
                              <button className="rounded-xl border border-black/15 bg-white px-3 py-1.5 text-xs hover:bg-black/5">
                                Approve
                              </button>
                            </form>

                            <form action={rejectRegistrationAction}>
                              <input type="hidden" name="registration_id" value={r.registration_id} />
                              <input type="hidden" name="back" value={backUrl} />
                              <button className="rounded-xl border border-red-300 bg-red-50 px-3 py-1.5 text-xs hover:bg-red-100">
                                Reject
                              </button>
                            </form>
                          </div>
                        ) : (
                          <span className="text-xs text-black/50">
                            {(r.status || "").toLowerCase() === "pending_review"
                              ? "Waiting details ✓"
                              : "—"}
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
        <div className="flex items-center justify-between gap-3 border-t border-black/10 bg-white px-4 py-3">
          <div className="text-xs text-black/60">
            Page {page} / {totalPages}
          </div>

          <div className="flex items-center gap-2">
            {prevHref ? (
              <Link href={prevHref} className="rounded-xl border border-black/15 bg-white px-3 py-1.5 text-xs hover:bg-black/5">
                ← Prev
              </Link>
            ) : (
              <span className="rounded-xl border border-black/10 bg-black/5 px-3 py-1.5 text-xs text-black/40">← Prev</span>
            )}

            {nextHref ? (
              <Link href={nextHref} className="rounded-xl border border-black/15 bg-white px-3 py-1.5 text-xs hover:bg-black/5">
                Next →
              </Link>
            ) : (
              <span className="rounded-xl border border-black/10 bg-black/5 px-3 py-1.5 text-xs text-black/40">Next →</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}