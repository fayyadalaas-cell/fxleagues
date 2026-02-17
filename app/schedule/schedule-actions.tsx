"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "../providers";

type Props = {
  tournament: {
    id: string;
    slug: string;
    title: string;
    type: string;
    prize: number;
    dateLabel: string;
    time: string;
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

    const { error } = await supabase.from("tournament_participants").insert({
      user_id: user.id,
      tournament_id: tournament.id,
      tournament_title: tournament.title,
      tournament_type: tournament.type,
      tournament_prize: tournament.prize,
      tournament_date_label: tournament.dateLabel,
      tournament_time: tournament.time,
    });

    setLoading(false);

    if (error) {
      // duplicate (unique user_id + tournament_id)
      if (error.code === "23505" || error.message.toLowerCase().includes("duplicate")) {
        alert("You already joined this tournament.");
        return;
      }
      alert(error.message);
      return;
    }

    // ✅ بعد الانضمام روح على الداش
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
