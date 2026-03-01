"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "../providers";

type Props = {
  tournament: {
    id: string;
    slug: string;
    title: string;
  };
};

export default function ScheduleActions({ tournament }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function join() {
    if (!user) {
      router.push(`/signin?next=${encodeURIComponent("/schedule")}`);
      return;
    }

    setLoading(true);

    // ✅ استخدم RPC (مش insert مباشر)
    const { error } = await supabase.rpc("join_tournament", {
      p_tournament_id: tournament.id,
    });

    setLoading(false);

    if (error) {
      const msg = (error.message || "").toLowerCase();

      if (error.code === "23505" || msg.includes("duplicate")) {
        alert("You already joined this tournament.");
        return;
      }

      // رسائل متوقعة من الـ RPC (حسب ما انت حاطط داخلها)
      if (msg.includes("banned") || msg.includes("restricted")) {
        alert("Your account is restricted from joining tournaments.");
        return;
      }
      if (msg.includes("closed") || msg.includes("ended") || msg.includes("completed")) {
        alert("This tournament has ended and cannot be joined.");
        return;
      }

      alert(error.message);
      return;
    }

    router.push("/account");
  }

  return (
    <div className="flex justify-end gap-2">
      <Link
        href={`/tournaments/${tournament.slug}`}
        className="inline-flex items-center justify-center rounded-lg border border-zinc-700/70 px-3 py-2 text-sm text-zinc-200 hover:bg-white/[0.04] min-w-[82px]"
      >
        Details
      </Link>

      <button
        onClick={join}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-3 py-2 text-sm font-bold text-black hover:bg-yellow-400 min-w-[70px] disabled:opacity-60"
      >
        {loading ? "Joining..." : "Join"}
      </button>
    </div>
  );
}