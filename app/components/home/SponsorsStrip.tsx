"use client";

import Link from "next/link";
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

export default function SponsorsStrip() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSponsors() {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setSponsors(data as Sponsor[]);
      }

      setLoading(false);
    }

    loadSponsors();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-zinc-500">
        Loading sponsors...
      </div>
    );
  }

  if (!sponsors.length) {
    return (
      <div className="text-sm text-zinc-500">
        No sponsors found.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div>
        <div className="text-xl font-bold text-yellow-400 tracking-tight">
          Official Tournament Partners
        </div>

       
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        {sponsors.map((s) => (
          <Link
            key={s.id}
            href={s.href || "#"}
            target={s.href?.startsWith("http") ? "_blank" : "_self"}
            className="h-16 md:h-24 rounded-xl border border-yellow-500/40 bg-gradient-to-b from-zinc-900/60 to-black flex items-center justify-center px-3 md:px-8 transition-all duration-300 hover:border-yellow-400/70 hover:shadow-[0_0_25px_rgba(234,179,8,0.25)]"
          >
            <img
              src={s.logo_path}
              alt={s.name}
              className="w-full h-full object-contain"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}