import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/adminGuard";
import EditTournamentClient from "./EditTournamentClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // ✅ لازم يكون داخل + Admin
  await requireAdmin();

  const id = params?.id;
  if (!id) redirect("/admin/tournaments");

  const { data, error } = await supabase
    .from("tournaments")
    .select("id,title,slug,description,start_date,end_date,type,status,prize_pool")
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="rounded-2xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-200">
            Failed to load tournament: {error?.message ?? "Not found"}
          </div>
        </div>
      </main>
    );
  }

  return <EditTournamentClient initial={data as TournamentRow} />;
}