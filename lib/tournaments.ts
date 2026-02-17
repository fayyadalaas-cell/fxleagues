// lib/tournamentsDb.ts
import { supabase } from "@/lib/supabase";

export type TournamentDB = {
  id: string; // uuid
  title: string;
  description: string | null;
  start_date: string; // timestamp string
  end_date: string | null;
  prize_pool: number | null;
  created_at: string;

  slug: string | null;

  status: string | null; // 'LIVE' | 'UPCOMING'
  type: string | null;   // 'Daily' | 'Weekly' | 'Monthly' | 'Special'
  sponsor_name: string | null;
  sponsor_logo_key: string | null; // 'fxleagues' | 'binance' | ...
  entry: string | null;  // 'FREE'
};

export async function fetchTournaments() {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("start_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as TournamentDB[];
}

export async function fetchTournamentBySlug(slug: string) {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as TournamentDB | null;
}
