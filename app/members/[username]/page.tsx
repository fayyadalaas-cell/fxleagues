"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  country: string | null;
  avatar_url: string | null;
  created_at: string;
};

type TournamentJoin =
  | { title: string | null; slug: string | null }
  | { title: string | null; slug: string | null }[]
  | null;

type RegistrationRow = {
  tournament_id: string;
  created_at: string;
  status: string | null;
  tournaments: TournamentJoin;
};

type RegistrationUI = {
  tournament_id: string;
  created_at: string;
  status: string | null;
  title: string | null;
  slug: string | null;
};

function normalizeTournament(t: TournamentJoin): { title: string | null; slug: string | null } {
  if (!t) return { title: null, slug: null };
  if (Array.isArray(t)) return t[0] ?? { title: null, slug: null };
  return t;
}

function statusLabel(s: string | null) {
  if (!s) return "REGISTERED";
  const v = String(s).toLowerCase();
  if (v.includes("pending")) return "JOINED PENDING";
  if (v.includes("approved") || v.includes("confirmed")) return "CONFIRMED";
  if (v.includes("rejected")) return "REJECTED";
  if (v.includes("cancel")) return "CANCELLED";
  return v.replaceAll("_", " ").toUpperCase();
}

function statusBadgeClass(s: string | null) {
  const v = String(s ?? "").toLowerCase();
  if (v.includes("rejected")) return "border-red-600/40 text-red-300 bg-red-500/10";
  if (v.includes("cancel")) return "border-zinc-700 text-zinc-300 bg-zinc-900/40";
  if (v.includes("approved") || v.includes("confirmed")) return "border-emerald-600/40 text-emerald-300 bg-emerald-500/10";
  // default (pending/unknown)
  return "border-yellow-600/40 text-yellow-200 bg-yellow-500/10";
}

export default function MemberProfilePage() {
  const params = useParams<{ username: string }>();
  const username = useMemo(() => decodeURIComponent(params.username), [params.username]);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [regs, setRegs] = useState<RegistrationUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setNotFound(false);

      // 1) Profile
      const { data: p, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, username, bio, country, avatar_url, created_at")
        .eq("username", username)
        .single();

      if (ignore) return;

      if (pErr || !p) {
        setNotFound(true);
        setProfile(null);
        setRegs([]);
        setLoading(false);
        return;
      }

      setProfile(p);

      // 2) Registrations (latest 20)
      const { data: r, error: rErr } = await supabase
        .from("tournament_registrations")
        .select("tournament_id, created_at, status, tournaments(title, slug)")
        .eq("user_id", p.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (ignore) return;

      if (rErr) {
        // لو صار خطأ بالـ join، لا نكسر الصفحة
        setRegs([]);
        setLoading(false);
        return;
      }

      const mapped: RegistrationUI[] = (r as RegistrationRow[] | null)?.map((row) => {
        const t = normalizeTournament(row.tournaments);
        return {
          tournament_id: row.tournament_id,
          created_at: row.created_at,
          status: row.status,
          title: t.title ?? null,
          slug: t.slug ?? null,
        };
      }) ?? [];

      setRegs(mapped);
      setLoading(false);
    }

    load();
    return () => {
      ignore = true;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-red-500 font-semibold">Member not found</p>
      </div>
    );
  }

  const firstLetter =
    profile.full_name?.trim().charAt(0) ||
    profile.username?.trim().charAt(0) ||
    "?";

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      {/* Profile Card */}
      <section className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-lg">
        <div className="flex items-start justify-between flex-col md:flex-row gap-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-black border border-zinc-800 overflow-hidden flex items-center justify-center">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-yellow-400 text-xl font-bold">
                  {firstLetter}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">
                {profile.full_name || profile.username}
              </h1>

              <div className="text-zinc-400 mt-1">@{profile.username}</div>

              <div className="mt-4 text-zinc-300">
                {profile.bio || "No bio yet."}
              </div>

              <div className="mt-4 text-xs text-zinc-500">
                Member since{" "}
                {new Date(profile.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })}
                {profile.country ? ` • ${profile.country}` : ""}
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
                <div className="bg-black/40 border border-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-white">{regs.length}</div>
                  <div className="text-xs text-zinc-500">Registrations</div>
                </div>

                <div className="bg-black/40 border border-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-white">0</div>
                  <div className="text-xs text-zinc-500">Wins</div>
                </div>

                <div className="bg-black/40 border border-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-white">—</div>
                  <div className="text-xs text-zinc-500">Rank</div>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/schedule"
            className="text-yellow-400 font-semibold hover:underline"
          >
            Browse schedule →
          </Link>
        </div>
      </section>

      {/* Registrations */}
      <div className="mt-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-bold text-zinc-900">Recent Registrations</h2>
          <div className="text-xs text-zinc-500">
            Showing last {Math.min(regs.length, 20)} items
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          {regs.length ? (
            regs.map((r) => {
              const openHref = r.slug ? `/tournaments/${encodeURIComponent(r.slug)}` : "/schedule";
              return (
                <div
                  key={`${r.tournament_id}-${r.created_at}`}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-6"
                >
                  <div className="min-w-0">
                    <div className="text-white font-bold truncate">
                      {r.title ?? r.tournament_id}
                    </div>

                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <div className="text-xs text-zinc-500">
                        {new Date(r.created_at).toLocaleString()}
                      </div>

                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadgeClass(
                          r.status
                        )}`}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={openHref}
                    className="text-yellow-400 font-bold hover:underline shrink-0"
                  >
                    Open →
                  </Link>
                </div>
              );
            })
          ) : (
            <div className="text-zinc-500">No registrations yet.</div>
          )}
        </div>
      </div>
    </main>
  );
}