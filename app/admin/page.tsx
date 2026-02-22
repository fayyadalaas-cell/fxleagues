import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminHomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-4xl font-extrabold">Admin</h1>
        <p className="mt-2 text-zinc-400">
          Manage tournaments, sponsors, and participants.
        </p>

        <div className="mt-8 grid gap-3">
          <Link
            href="/admin/tournaments"
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 hover:bg-white/[0.03] transition"
          >
            Tournaments
          </Link>

          <Link
            href="/admin/sponsors"
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 hover:bg-white/[0.03] transition"
          >
            Sponsors
          </Link>

          <Link
            href="/admin/participants"
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 hover:bg-white/[0.03] transition"
          >
            Participants
          </Link>

          <Link
            href="/admin/registrations"
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 hover:bg-white/[0.03] transition"
          >
            Registrations
          </Link>
        </div>
      </div>
    </main>
  );
}