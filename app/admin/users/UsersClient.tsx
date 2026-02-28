"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AdminUserRow } from "./types";
import { adminUpdateUsername } from "./actions";
import { adminVerifyEmail } from "./verifyActions";
import { adminResendVerification } from "./resendActions";
import { adminDeleteUser } from "./deleteActions";

export default function UsersClient({ initial }: { initial: AdminUserRow[] }) {
  const [rows, setRows] = useState<AdminUserRow[]>(initial);
  const [q, setQ] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [edit, setEdit] = useState<{
    id: string;
    email: string;
    value: string;
  } | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((u) => {
      const hay = [u.email ?? "", u.phone ?? "", u.username ?? "", u.id ?? ""]
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [rows, q]);

  async function setBan(userId: string, isBanned: boolean) {
    setSavingId(userId);
    setToast(null);

    // optimistic update
    setRows((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_banned: isBanned } : u))
    );

    try {
      const res = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, is_banned: isBanned }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        // rollback
        setRows((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_banned: !isBanned } : u))
        );
        throw new Error(json?.error || "Failed to update user.");
      }

      setToast(isBanned ? "User restricted ✅" : "User unblocked ✅");
    } catch (e: any) {
      setToast(e?.message ?? "Something went wrong.");
    } finally {
      setSavingId(null);
      setTimeout(() => setToast(null), 2500);
    }
  }

  async function saveUsername() {
    if (!edit) return;

    const userId = edit.id;
    const next = edit.value;

    setSavingId(userId);
    setToast(null);

    // optimistic update
    setRows((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, username: next } : u))
    );

    try {
      const res = await adminUpdateUsername(userId, next);

      if (!res?.ok) {
        throw new Error(res?.error || "Failed to update username.");
      }

      setToast("Username updated ✅");
      setEdit(null);
    } catch (e: any) {
      setToast(e?.message ?? "Something went wrong.");
    } finally {
      setSavingId(null);
      setTimeout(() => setToast(null), 2500);
    }
  }

  async function verifyEmail(userId: string) {
    setSavingId(userId);
    setToast(null);

    // optimistic update: mark verified
    setRows((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, email_verified: true } : u))
    );

    try {
      const res = await adminVerifyEmail(userId);

      if (!res?.ok) {
        // rollback if failed
        setRows((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, email_verified: false } : u))
        );
        throw new Error(res?.error || "Failed to verify email.");
      }

      setToast("Email verified ✅");
    } catch (e: any) {
      setToast(e?.message ?? "Something went wrong.");
    } finally {
      setSavingId(null);
      setTimeout(() => setToast(null), 2500);
    }
  }

  async function resendEmail(email: string, userId: string) {
    if (!email) {
      setToast("No email found for this user.");
      setTimeout(() => setToast(null), 2500);
      return;
    }

    setSavingId(userId);
    setToast(null);

    try {
      const res = await adminResendVerification(email);

      if (!res?.ok) {
        throw new Error(res?.error || "Failed to resend email.");
      }

      setToast("Verification email sent 📩");
    } catch (e: any) {
      setToast(e?.message ?? "Something went wrong.");
    } finally {
      setSavingId(null);
      setTimeout(() => setToast(null), 2500);
    }
  }

  async function deleteUser(userId: string, email?: string | null) {
    if (!email || (!email.includes("@test") && !email.includes("+test"))) {
      setToast("Delete allowed for test accounts only ⚠️");
      setTimeout(() => setToast(null), 2500);
      return;
    }

    const confirmText = prompt(
      `Type DELETE to permanently remove this user:\n${email}`
    );
    if (confirmText !== "DELETE") return;

    setSavingId(userId);
    setToast(null);

    try {
      const res = await adminDeleteUser(userId);

      if (!res?.ok) {
        throw new Error(res?.error || "Failed to delete user.");
      }

      // remove from UI
      setRows((prev) => prev.filter((u) => u.id !== userId));

      setToast("User deleted permanently 🗑️");
    } catch (e: any) {
      setToast(e?.message ?? "Something went wrong.");
    } finally {
      setSavingId(null);
      setTimeout(() => setToast(null), 2500);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Link href="/admin" className="text-amber-400 hover:underline">
              ← Back to Admin
            </Link>
            <h1 className="mt-3 text-3xl font-semibold">Users</h1>
            <p className="mt-1 text-neutral-400">
              Search, edit usernames, verify email, and restrict (soft-ban) users.
            </p>
          </div>

          <div className="w-full max-w-md">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search: email, phone, username, id..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-500/40"
            />
            {toast && (
              <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
                {toast}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-black/30 text-neutral-300">
                <tr>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Username</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Verified</th>
                  <th className="px-4 py-3 text-left">Restricted</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const banned = Boolean(u.is_banned);
                  const busy = savingId === u.id;
                  const emailVerified = Boolean((u as any).email_verified);

                  const isTestEmail =
                    (u.email ?? "").includes("@test") ||
                    (u.email ?? "").includes("+test");

                  return (
                    <tr key={u.id} className="border-t border-white/5">
                      <td className="px-4 py-3">
                        <div className="text-white">{u.email ?? "—"}</div>
                        <div className="text-xs text-neutral-500">{u.id}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span>{u.username ?? "—"}</span>
                          <button
                            onClick={() =>
                              setEdit({
                                id: u.id,
                                email: u.email ?? "",
                                value: u.username ?? "",
                              })
                            }
                            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-neutral-200 hover:bg-white/10"
                          >
                            Edit
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3">{u.phone ?? "—"}</td>

                      <td className="px-4 py-3">
                        {emailVerified ? (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200">
                            YES
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-zinc-500/15 px-2 py-1 text-xs text-zinc-300">
                              NO
                            </span>

                            <button
                              onClick={() => verifyEmail(u.id)}
                              disabled={busy}
                              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60"
                            >
                              {busy ? "..." : "Verify"}
                            </button>

                            <button
                              onClick={() => resendEmail(u.email ?? "", u.id)}
                              disabled={busy}
                              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-200 hover:bg-amber-500/20 disabled:opacity-60"
                            >
                              {busy ? "..." : "Resend"}
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {banned ? (
                          <span className="rounded-full bg-red-500/15 px-2 py-1 text-xs text-red-200">
                            RESTRICTED
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs text-amber-200">
                            ACTIVE
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {!banned ? (
                          <button
                            onClick={() => setBan(u.id, true)}
                            disabled={busy}
                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-red-200 hover:bg-red-500/20 disabled:opacity-60"
                          >
                            {busy ? "..." : "Restrict"}
                          </button>
                        ) : (
                          <button
                            onClick={() => setBan(u.id, false)}
                            disabled={busy}
                            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60"
                          >
                            {busy ? "..." : "Unblock"}
                          </button>
                        )}

                        {isTestEmail ? (
                          <button
                            onClick={() => deleteUser(u.id, u.email)}
                            disabled={busy}
                            className="ml-2 rounded-xl border border-red-700/40 bg-red-900/30 px-4 py-2 text-red-300 hover:bg-red-900/50 disabled:opacity-60"
                          >
                            {busy ? "..." : "Delete"}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-neutral-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-xs text-neutral-500">
          Tip: Soft-ban affects joining tournaments via RPC (join_tournament).
        </div>
      </div>

      {/* Modal */}
      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Edit Username</div>
                <div className="mt-1 text-xs text-neutral-400">
                  {edit.email || edit.id}
                </div>
              </div>

              <button
                onClick={() => setEdit(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-200 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="mt-4">
              <label className="text-xs text-neutral-400">Username</label>
              <input
                value={edit.value}
                onChange={(e) =>
                  setEdit((prev) =>
                    prev ? { ...prev, value: e.target.value } : prev
                  )
                }
                placeholder="e.g. alaa_fayyad"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-500/40"
              />
              <div className="mt-2 text-xs text-neutral-500">
                Allowed: a-z, 0-9, underscore. Length: 3–20.
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setEdit(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                onClick={saveUsername}
                disabled={savingId === edit.id}
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-200 hover:bg-amber-500/20 disabled:opacity-60"
              >
                {savingId === edit.id ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}