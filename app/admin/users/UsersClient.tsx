"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AdminUserRow } from "./types";

export default function UsersClient({ initial }: { initial: AdminUserRow[] }) {
  const [rows, setRows] = useState<AdminUserRow[]>(initial);
  const [q, setQ] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((u) => {
      const hay = [
        u.email ?? "",
        u.phone ?? "",
        u.username ?? "",
        u.id ?? "",
      ].join(" ").toLowerCase();
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
              Search and restrict (soft-ban) users.
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

                  return (
                    <tr key={u.id} className="border-t border-white/5">
                      <td className="px-4 py-3">
                        <div className="text-white">{u.email ?? "—"}</div>
                        <div className="text-xs text-neutral-500">{u.id}</div>
                      </td>
                      <td className="px-4 py-3">{u.username ?? "—"}</td>
                      <td className="px-4 py-3">{u.phone ?? "—"}</td>
                      <td className="px-4 py-3">
                        {u.phone_verified ? (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200">
                            YES
                          </span>
                        ) : (
                          <span className="rounded-full bg-zinc-500/15 px-2 py-1 text-xs text-zinc-300">
                            NO
                          </span>
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
    </main>
  );
}