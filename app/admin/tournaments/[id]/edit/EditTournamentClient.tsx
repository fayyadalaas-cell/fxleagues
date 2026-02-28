"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type TournamentRow = {
  id: string;
  title: string | null;
  slug: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  type: "Daily" | "Weekly" | "Monthly" | "Special" | string | null;
  status: "UPCOMING" | "LIVE" | "COMPLETED" | string | null;
  prize_pool: number | null;
};

function toDatetimeLocalValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function toIsoFromDatetimeLocal(val: string) {
  if (!val) return null;
  const d = new Date(val);
  return d.toISOString();
}

export default function EditTournamentClient({ initial }: { initial: TournamentRow }) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // form state
  const [title, setTitle] = useState(initial.title ?? "");
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [startLocal, setStartLocal] = useState(toDatetimeLocalValue(initial.start_date));
  const [endLocal, setEndLocal] = useState(toDatetimeLocalValue(initial.end_date));
  const [type, setType] = useState<"Daily" | "Weekly" | "Monthly" | "Special">(
    (initial.type as any) ?? "Daily"
  );
  const [status, setStatus] = useState<"UPCOMING" | "LIVE" | "COMPLETED">(
    (initial.status as any) ?? "UPCOMING"
  );
  const [prizePool, setPrizePool] = useState<number>(Number(initial.prize_pool ?? 0));

  const safeId = useMemo(() => initial.id, [initial.id]);

  const autoSlug = () => {
    const s = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setSlug(s);
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!safeId) return;

    setSaving(true);
    setErr(null);

    try {
      const payload: Partial<TournamentRow> = {
        title: title.trim(),
        slug: slug.trim() || null,
        description: description.trim() || null,
        start_date: toIsoFromDatetimeLocal(startLocal),
        end_date: endLocal ? toIsoFromDatetimeLocal(endLocal) : null,
        type,
        status,
        prize_pool: Number.isFinite(prizePool) ? prizePool : 0,
      };

      const { error } = await supabase.from("tournaments").update(payload).eq("id", safeId);
      if (error) throw new Error(error.message);

      router.push("/admin/tournaments");
      router.refresh();
    } catch (ex: any) {
      setErr(ex?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!safeId) return;

    const ok = confirm("Delete this tournament? This cannot be undone.");
    if (!ok) return;

    setSaving(true);
    setErr(null);

    try {
      const { error } = await supabase.from("tournaments").delete().eq("id", safeId);
      if (error) throw new Error(error.message);

      router.push("/admin/tournaments");
      router.refresh();
    } catch (ex: any) {
      setErr(ex?.message ?? "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/admin/tournaments" className="text-amber-400 hover:underline">
              ← Back
            </Link>
            <h1 className="text-3xl font-semibold mt-3">Edit Tournament</h1>
            <p className="text-neutral-400 mt-1">Update tournament details.</p>
          </div>

          <button
            onClick={onDelete}
            disabled={saving}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-red-200 hover:bg-red-500/20 disabled:opacity-50"
          >
            Delete
          </button>
        </div>

        {err && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {err}
          </div>
        )}

        <form
          onSubmit={onSave}
          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_0_60px_rgba(0,0,0,0.55)]"
        >
          <div className="grid gap-4">
            <div>
              <label className="text-sm text-neutral-300">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-amber-500/40"
                placeholder="Tournament title"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-neutral-300">Slug (optional)</label>
                <button type="button" onClick={autoSlug} className="text-xs text-amber-400 hover:underline">
                  Auto-generate
                </button>
              </div>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-amber-500/40"
                placeholder="daily-sprint"
              />
              <p className="mt-2 text-xs text-neutral-500">If empty, details pages can still use the UUID id.</p>
            </div>

            <div>
              <label className="text-sm text-neutral-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 w-full min-h-[110px] rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-amber-500/40"
                placeholder="Short description…"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-neutral-300">Start</label>
                <input
                  type="datetime-local"
                  value={startLocal}
                  onChange={(e) => setStartLocal(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-amber-500/40"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-neutral-300">End (optional)</label>
                <input
                  type="datetime-local"
                  value={endLocal}
                  onChange={(e) => setEndLocal(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-amber-500/40"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm text-neutral-300">Prize Pool</label>
                <input
                  type="number"
                  value={prizePool}
                  onChange={(e) => setPrizePool(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-amber-500/40"
                  min={0}
                />
              </div>

              <div>
                <label className="text-sm text-neutral-300">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-amber-500/40"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Special">Special</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-neutral-300">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-amber-500/40"
                >
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="LIVE">LIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black hover:bg-amber-400 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-neutral-500">
          Tournament ID: <span className="text-neutral-300">{safeId}</span>
        </div>
      </div>
    </main>
  );
}