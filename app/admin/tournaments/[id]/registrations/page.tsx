// app/admin/demo-submissions/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type SearchParams = {
  tournament?: string;
  status?: string;
};

export const dynamic = "force-dynamic";

/**
 * ✅ Approve/Reject from the global queue
 * - Updates tournament_registrations (this is what affects the client)
 * - Updates tournament_credentials (for demo review tracking)
 */
async function updateStatus(formData: FormData) {
  "use server";

  const credentialId = String(formData.get("credential_id") || "");
  const tournamentId = String(formData.get("tournament_id") || "");
  const userId = String(formData.get("user_id") || "");
  const action = String(formData.get("action") || ""); // approve | reject
  const returnTo = String(formData.get("return_to") || "/admin/demo-submissions");

  if (!credentialId || !tournamentId || !userId || !action) return;

  const supabase = await createClient();

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) return;

  const decidedBy = userRes.user.id;
  const decidedAt = new Date().toISOString();
  

  // 1) Update tournament_registrations (THIS affects the client)
  const regPayload =
    action === "approve"
      ? {
          status: "approved",
          admin_decision: "APPROVED",
          decided_at: decidedAt,
          decided_by: decidedBy,
        }
      : {
          status: "rejected",
          admin_decision: "REJECTED",
          decided_at: decidedAt,
          decided_by: decidedBy,
        };

  // ✅ Same safety as your per-tournament page: only decide if pending_review
  await supabase
    .from("tournament_registrations")
    .update(regPayload)
    .eq("tournament_id", tournamentId)
    .eq("user_id", userId)
    .eq("status", "pending_review");

  // 2) Update tournament_credentials (queue item itself)
  const credStatus = action === "approve" ? "approved" : "rejected";

  await supabase
    .from("tournament_credentials")
    .update({
      status: credStatus,
      reviewed_at: decidedAt,
      reviewed_by: decidedBy,
    })
    .eq("id", credentialId);

  revalidatePath("/admin/demo-submissions");
  redirect(returnTo);
}

function badge(status: string) {
  const s = (status || "").toLowerCase();
  const base = "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium";
  if (s === "approved") return `${base} bg-green-500/15 text-green-300 ring-1 ring-green-500/30`;
  if (s === "rejected") return `${base} bg-red-500/15 text-red-300 ring-1 ring-red-500/30`;
  if (s === "submitted") return `${base} bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30`;
  return `${base} bg-white/10 text-white/80 ring-1 ring-white/15`;
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const tournamentFilter = typeof sp.tournament === "string" ? sp.tournament : "";
  const statusFilter = typeof sp.status === "string" ? sp.status.toLowerCase() : "";

  const supabase = await createClient();

  // ✅ 1) must be signed in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/admin/demo-submissions");

  // ✅ 2) admin check
  const { data: isAdminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!isAdminRow) redirect("/");

  // ✅ 3) tournaments dropdown
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id,title")
    .order("created_at", { ascending: false });

  // ✅ 4) demo submissions (from tournament_credentials)
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
      reviewed_at,
      review_note,
      tournaments:tournament_id ( id, title ),
      profiles:user_id ( id, email, full_name, username )
    `
    )
    .order("created_at", { ascending: false });

  if (tournamentFilter) q = q.eq("tournament_id", tournamentFilter);
  if (statusFilter) q = q.eq("status", statusFilter);

  const { data: rows, error } = await q;

  // ✅ 5) Stats
  const totalSubmitted = (rows || []).filter((r: any) => (r.status || "").toLowerCase() === "submitted").length;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Demo Submissions</h1>
            <p className="text-white/60 text-sm mt-1">
              Queue of submitted demo credentials for review.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              ← Back to Admin
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-white/60 text-xs">Pending (submitted)</div>
            <div className="text-2xl font-bold mt-1">{totalSubmitted}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-white/60 text-xs">Filter</div>
            <div className="text-sm mt-1 text-white/80">Tournament + Status</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-white/60 text-xs">Tip</div>
            <div className="text-sm mt-1 text-white/80">
              Start with <span className="font-semibold">submitted</span> only.
            </div>
          </div>
        </div>

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
              <label className="text-xs text-white/60">Status</label>
              <select
                name="status"
                defaultValue={statusFilter}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none"
              >
                <option value="">All statuses</option>
                <option value="submitted">submitted</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
                <option value="draft">draft</option>
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

        <div className="mt-6">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              Error: {error.message}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/70">
                <tr>
                  <th className="text-left p-3">Tournament</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Platform</th>
                  <th className="text-left p-3">Login</th>
                  <th className="text-left p-3">Server</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Submitted</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {(rows || []).map((r: any) => {
                  const isSubmitted = (r.status || "").toLowerCase() === "submitted";

                  return (
                    <tr key={r.id} className="border-t border-white/10">
                      <td className="p-3">{r.tournaments?.title ?? r.tournament_id}</td>

                      <td className="p-3">
                        <div className="text-white/90">
                          {r.profiles?.full_name || r.profiles?.username || "User"}
                        </div>
                        <div className="text-xs text-white/50">
                          {r.profiles?.email ?? r.user_id}
                        </div>
                      </td>

                      <td className="p-3">{r.platform}</td>
                      <td className="p-3">{r.login}</td>
                      <td className="p-3">{r.server}</td>

                      <td className="p-3">
                        <span className={badge(r.status)}>{r.status}</span>
                      </td>

                      <td className="p-3 text-white/70">
                        {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                      </td>

                      <td className="p-3">
                        {isSubmitted ? (
                          <div className="flex gap-2">
                            <form action={updateStatus}>
                              <input type="hidden" name="credential_id" value={r.id} />
                              <input type="hidden" name="tournament_id" value={r.tournament_id} />
                              <input type="hidden" name="user_id" value={r.user_id} />
                              <input type="hidden" name="action" value="approve" />
                              <button
                                type="submit"
                                className="px-3 py-1 text-xs rounded-lg bg-green-600 hover:bg-green-500"
                              >
                                Approve
                              </button>
                            </form>

                            <form action={updateStatus}>
                              <input type="hidden" name="credential_id" value={r.id} />
                              <input type="hidden" name="tournament_id" value={r.tournament_id} />
                              <input type="hidden" name="user_id" value={r.user_id} />
                              <input type="hidden" name="action" value="reject" />
                              <button
                                type="submit"
                                className="px-3 py-1 text-xs rounded-lg bg-red-600 hover:bg-red-500"
                              >
                                Reject
                              </button>
                            </form>
                          </div>
                        ) : (
                          <span className="text-xs text-white/50">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {(!rows || rows.length === 0) && (
                  <tr className="border-t border-white/10">
                    <td className="p-6 text-white/60" colSpan={8}>
                      No submissions found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-white/50">
            Next step: (optional) show registration status + decision notes.
          </div>
        </div>
      </div>
    </main>
  );
}