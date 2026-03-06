"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Sponsor = {
  id: string;
  name: string;
  logo_path: string;
  href: string | null;
  sort_order: number;
  is_active: boolean;
};

type EditingState = Record<
  string,
  {
    name: string;
    logo_path: string;
    href: string;
    sort_order: number;
    is_active: boolean;
  }
>;

export default function SponsorsAdminPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState>({});
  const [savingOrder, setSavingOrder] = useState(false);

  async function loadSponsors() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sponsors")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (!error && data) {
      setSponsors(data as Sponsor[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSponsors();
  }, []);

  async function addSponsor() {
    const name = prompt("Sponsor name");
    const logo = prompt("Logo path (مثال: /brokers/exness.png)");
    const link = prompt("Link (مثال: /brokers/exness أو https://example.com)");
    const sort = prompt("Sort order (مثال: 1)");

    if (!name || !logo) return;

    await supabase.from("sponsors").insert({
      name: name.trim(),
      logo_path: logo.trim(),
      href: link?.trim() || null,
      sort_order: Number(sort || sponsors.length),
      is_active: true,
    });

    await loadSponsors();
  }

  function startEdit(s: Sponsor) {
    setEditingId(s.id);
    setEditing((prev) => ({
      ...prev,
      [s.id]: {
        name: s.name || "",
        logo_path: s.logo_path || "",
        href: s.href || "",
        sort_order: s.sort_order ?? 0,
        is_active: !!s.is_active,
      },
    }));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function updateField(
    id: string,
    field: "name" | "logo_path" | "href" | "sort_order" | "is_active",
    value: string | number | boolean
  ) {
    setEditing((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  }

  async function saveEdit(id: string) {
    const row = editing[id];
    if (!row) return;

    await supabase
      .from("sponsors")
      .update({
        name: row.name.trim(),
        logo_path: row.logo_path.trim(),
        href: row.href.trim() || null,
        sort_order: Number(row.sort_order || 0),
        is_active: row.is_active,
      })
      .eq("id", id);

    setEditingId(null);
    await loadSponsors();
  }

  async function deleteSponsor(id: string) {
    if (!confirm("Delete sponsor?")) return;

    await supabase.from("sponsors").delete().eq("id", id);
    await loadSponsors();
  }

  async function saveOrder(updated: Sponsor[]) {
    try {
      setSavingOrder(true);

      const payload = updated.map((item, index) => ({
        id: item.id,
        sort_order: index,
      }));

      for (const row of payload) {
        await supabase
          .from("sponsors")
          .update({ sort_order: row.sort_order })
          .eq("id", row.id);
      }

      await loadSponsors();
    } finally {
      setSavingOrder(false);
    }
  }

  async function moveSponsor(id: string, direction: "up" | "down") {
    const currentIndex = sponsors.findIndex((s) => s.id === id);
    if (currentIndex === -1) return;

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sponsors.length) return;

    const updated = [...sponsors];
    const temp = updated[currentIndex];
    updated[currentIndex] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reindexed = updated.map((item, index) => ({
      ...item,
      sort_order: index,
    }));

    setSponsors(reindexed);
    await saveOrder(reindexed);
  }

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Sponsors</h1>
          <div className="text-sm text-zinc-500 mt-1">
            رتّب العناصر بالأسهم ↑ ↓ أو عدّل Sort Order يدويًا.
          </div>
        </div>

        <button
          onClick={addSponsor}
          className="px-5 py-3 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition"
        >
          Add Sponsor
        </button>
      </div>

      {savingOrder ? (
        <div className="text-sm text-yellow-400">Saving order...</div>
      ) : null}

      <div className="space-y-4">
        {sponsors.map((s, index) => {
          const isEditing = editingId === s.id;
          const row = editing[s.id];

          return (
            <div
              key={s.id}
              className="border border-white/20 rounded-lg p-4 bg-black"
            >
              {!isEditing ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => moveSponsor(s.id, "up")}
                        disabled={index === 0 || savingOrder}
                        className="h-9 w-9 rounded-lg border border-white/10 bg-zinc-950 text-white hover:bg-white/5 disabled:opacity-30"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveSponsor(s.id, "down")}
                        disabled={index === sponsors.length - 1 || savingOrder}
                        className="h-9 w-9 rounded-lg border border-white/10 bg-zinc-950 text-white hover:bg-white/5 disabled:opacity-30"
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>

                    <div className="h-14 w-28 bg-white rounded-md flex items-center justify-center overflow-hidden px-3 shrink-0">
                      <img
                        src={s.logo_path}
                        alt={s.name}
                        className="max-h-10 w-auto object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="font-bold text-2xl uppercase">{s.name}</div>
                      <div className="text-sm text-zinc-400 break-all">{s.href}</div>
                      <div className="text-xs text-zinc-500 mt-1">
                        Logo: {s.logo_path} | Sort: {s.sort_order} |{" "}
                        {s.is_active ? "Active" : "Hidden"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => startEdit(s)}
                      className="px-4 py-2 rounded-lg border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteSponsor(s.id)}
                      className="px-4 py-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-zinc-400 block mb-1">Name</label>
                      <input
                        value={row?.name || ""}
                        onChange={(e) => updateField(s.id, "name", e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-zinc-400 block mb-1">Link</label>
                      <input
                        value={row?.href || ""}
                        onChange={(e) => updateField(s.id, "href", e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-zinc-400 block mb-1">Logo Path</label>
                      <input
                        value={row?.logo_path || ""}
                        onChange={(e) => updateField(s.id, "logo_path", e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-zinc-400 block mb-1">Sort Order</label>
                      <input
                        type="number"
                        value={row?.sort_order ?? 0}
                        onChange={(e) => updateField(s.id, "sort_order", Number(e.target.value))}
                        className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
                      <input
                        type="checkbox"
                        checked={!!row?.is_active}
                        onChange={(e) => updateField(s.id, "is_active", e.target.checked)}
                      />
                      Active on homepage
                    </label>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-zinc-950 p-4">
                    <div className="text-sm text-zinc-400 mb-2">Preview</div>
                    <div className="h-16 w-40 bg-white rounded-md flex items-center justify-center overflow-hidden px-4">
                      <img
                        src={row?.logo_path || ""}
                        alt={row?.name || ""}
                        className="max-h-10 w-auto object-contain"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => saveEdit(s.id)}
                      className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition"
                    >
                      Save
                    </button>

                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}