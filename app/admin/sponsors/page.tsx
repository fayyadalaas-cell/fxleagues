"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Sponsor = {
  id: string;
  name: string;
  logo_path: string;
  href: string;
  sort_order: number;
  is_active: boolean;
};

export default function SponsorsAdminPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSponsors() {
    const { data } = await supabase
      .from("sponsors")
      .select("*")
      .order("sort_order", { ascending: true });

    if (data) setSponsors(data);
    setLoading(false);
  }

  useEffect(() => {
    loadSponsors();
  }, []);

  async function addSponsor() {
    const name = prompt("Sponsor name");
    const logo = prompt("Logo path (مثال: /sponsors/exness.png)");
    const link = prompt("Link");

    if (!name || !logo) return;

    await supabase.from("sponsors").insert({
      name,
      logo_path: logo,
      href: link,
    });

    loadSponsors();
  }

  async function deleteSponsor(id: string) {
    if (!confirm("Delete sponsor?")) return;

    await supabase.from("sponsors").delete().eq("id", id);
    loadSponsors();
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sponsors</h1>

        <button
          onClick={addSponsor}
          className="px-4 py-2 bg-yellow-500 text-black rounded"
        >
          Add Sponsor
        </button>
      </div>

      <div className="space-y-4">
        {sponsors.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between border p-4 rounded"
          >
            <div className="flex items-center gap-4">
              <img
                src={s.logo_path}
                alt={s.name}
                className="h-10 object-contain"
              />

              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm text-gray-400">{s.href}</div>
              </div>
            </div>

            <button
              onClick={() => deleteSponsor(s.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}