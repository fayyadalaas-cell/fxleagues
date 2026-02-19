"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function NewTournamentPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [prize, setPrize] = useState<number>(0);
  const [type, setType] = useState("Daily");
  const [status, setStatus] = useState("UPCOMING");
  const [loading, setLoading] = useState(false);

  function makeSlug(input: string) {
    return (input || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // remove weird chars
      .replace(/\s+/g, "-")        // spaces -> dashes
      .replace(/-+/g, "-");        // multiple dashes -> one
  }

  async function handleCreate() {
    if (!title || !start) return alert("Title and start date required");

    setLoading(true);

    const payload = {
      title,
      slug: slug ? makeSlug(slug) : makeSlug(title),
      start_date: start,
      end_date: end || null,
      prize_pool: prize,
      type,
      status, // UPCOMING أو COMPLETED فقط — LIVE بيتحسب تلقائياً من الوقت
    };

    const { error } = await supabase.from("tournaments").insert(payload);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/admin/tournaments");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/admin/tournaments" className="text-yellow-400 hover:underline text-sm">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold mt-4">New Tournament</h1>

        <div className="mt-6 flex flex-col gap-4">
          <input
            className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
            placeholder="Slug (optional)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

          {/* Start Date */}
          <input
            type="datetime-local"
            className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />

          {/* End Date */}
          <input
            type="datetime-local"
            className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />

          <input
            type="number"
            className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
            placeholder="Prize pool"
            value={prize}
            onChange={(e) => setPrize(Number(e.target.value))}
          />

          <select
            className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Special</option>
          </select>

          {/* Status: لا LIVE يدوي - LIVE محسوب تلقائياً حسب start/end */}
          <select
            className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>UPCOMING</option>
            <option>COMPLETED</option>
          </select>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Tournament"}
          </button>
        </div>
      </div>
    </main>
  );
}
