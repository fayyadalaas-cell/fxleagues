"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Row = {
  id: string;
  email: string;
  status: string;
  source: string | null;
  created_at: string;
};

export default function AdminNewsletterPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unsubscribed">("all");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!qq) return true;
      return (
        r.email.toLowerCase().includes(qq) ||
        (r.source || "").toLowerCase().includes(qq)
      );
    });
  }, [rows, q, statusFilter]);

  async function load() {
    setLoading(true);
    setErr(null);

    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (sessionErr || !token) {
      setErr("No session token found. Please login again.");
      setRows([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/newsletter/list", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.message || `Request failed (${res.status})`);
        setRows([]);
        setLoading(false);
        return;
      }

      setRows((data?.rows || []) as Row[]);
    } catch {
      setErr("Network error while loading subscribers.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    const header = ["email", "status", "source", "created_at"];
    const lines = [
      header.join(","),
      ...filtered.map((r) =>
        [
          r.email,
          r.status,
          r.source || "",
          r.created_at,
        ]
          .map((v) => `"${String(v).replaceAll('"', '""')}"`)
          .join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  async function copyEmails() {
    const emails = filtered.map((r) => r.email).join(", ");
    await navigator.clipboard.writeText(emails);
    alert(`Copied ${filtered.length} emails`);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
          <div className="mt-1 text-sm text-zinc-400">
            Total: <span className="text-white font-semibold">{rows.length}</span> · Showing:{" "}
            <span className="text-white font-semibold">{filtered.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900"
          >
            Refresh
          </button>
          <button
            onClick={copyEmails}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900"
          >
            Copy emails
          </button>
          <button
            onClick={exportCSV}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col md:flex-row gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email or source..."
          className="w-full md:flex-1 rounded-xl border border-zinc-800 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-yellow-500/60"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="w-full md:w-56 rounded-xl border border-zinc-800 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-yellow-500/60"
        >
          <option value="all">All statuses</option>
          <option value="active">Active only</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="grid grid-cols-12 bg-zinc-950 px-4 py-3 text-xs text-zinc-400">
          <div className="col-span-5">Email</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Source</div>
          <div className="col-span-3">Date</div>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm text-zinc-400">Loading...</div>
        ) : err ? (
          <div className="px-4 py-6 text-sm text-red-300">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-6 text-sm text-zinc-400">No matching subscribers.</div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-12 px-4 py-3 border-t border-zinc-800 text-sm"
            >
              <div className="col-span-5">{r.email}</div>
              <div className="col-span-2">{r.status}</div>
              <div className="col-span-2">{r.source || "-"}</div>
              <div className="col-span-3">{new Date(r.created_at).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}