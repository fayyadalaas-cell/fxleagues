"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { supabase } from "../../lib/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
};

type TabKey = "joined" | "won" | "lost";

type DemoTournament = {
  id: string;
  title: string;
  dateLabel: string;
  time: string;
  type: "Daily" | "Weekly" | "Monthly" | "Special";
  status: "UPCOMING" | "LIVE" | "ENDED";
  prize: number;
};

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState<string | null>(null);

  const [tab, setTab] = useState<TabKey>("joined");
  const [stats, setStats] = useState({ joined: 0, won: 0, lost: 0 });

  // ✅ Real participation (from DB)
  const [realJoined, setRealJoined] = useState<DemoTournament[] | null>(null);
  const [joinedSlugSet, setJoinedSlugSet] = useState<Set<string>>(new Set());
  const [joinLoadErr, setJoinLoadErr] = useState<string | null>(null);

  // تغيير كلمة المرور
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<string | null>(null);

  // ✅ حماية الصفحة
  useEffect(() => {
    if (!loading && !user) router.replace("/signin?next=/account");
  }, [loading, user, router]);

  // ✅ جلب / إنشاء profile
  useEffect(() => {
    if (!user) return;

    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setName(data.full_name ?? "");
        return;
      }

      // احتياط: إنشاء profile إذا مش موجود
      await supabase.from("profiles").insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || null,
      });

      const { data: created } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .eq("id", user.id)
        .single();

      if (created) {
        setProfile(created);
        setName(created.full_name ?? "");
      }
    })();
  }, [user]);

  // ✅ Stats: read from tournament_registrations (source of truth)
  useEffect(() => {
    if (!user) return;

    (async () => {
      const { data, error } = await supabase
        .from("tournament_registrations")
        .select("id")
        .eq("user_id", user.id);

      if (!error && data) {
        setStats({ joined: data.length, won: 0, lost: 0 });
      }
    })();
  }, [user]);

  // ✅ Load real joined tournaments for this user (from tournament_registrations)
  useEffect(() => {
    if (!user) return;

    (async () => {
      setJoinLoadErr(null);

      // 1) Get tournament ids the user joined
      const { data: parts, error: pErr } = await supabase
        .from("tournament_registrations")
        .select("tournament_id")
        .eq("user_id", user.id);

      if (pErr) {
        setJoinLoadErr(pErr.message);
        setRealJoined([]);
        setJoinedSlugSet(new Set());
        return;
      }

      const ids = (parts ?? [])
        .map((x: any) => x.tournament_id)
        .filter(Boolean);

      if (ids.length === 0) {
        setRealJoined([]);
        setJoinedSlugSet(new Set());
        return;
      }

      // 2) Fetch tournaments info
      const { data: ts, error: tErr } = await supabase
        .from("tournaments")
        .select("id, slug, title, start_date, end_date, prize_pool")
        .in("id", ids);

      if (tErr) {
        setJoinLoadErr(tErr.message);
        setRealJoined([]);
        setJoinedSlugSet(new Set());
        return;
      }

      const now = new Date();

      const mapped: DemoTournament[] = (ts ?? []).map((t: any) => {
        const start = t.start_date ? new Date(t.start_date) : null;
        const end = t.end_date ? new Date(t.end_date) : null;

        let status: DemoTournament["status"] = "UPCOMING";
        if (start && start <= now) status = "LIVE";
        if (end && end < now) status = "ENDED";

        const title: string = t.title ?? "Tournament";
        const typeGuess = (() => {
          const s = title.toLowerCase();
          if (s.includes("daily")) return "Daily";
          if (s.includes("weekly") || s.includes("friday") || s.includes("sunday")) return "Weekly";
          if (s.includes("monthly")) return "Monthly";
          return "Special";
        })();

        const dateLabel = start
          ? start.toLocaleDateString("en-US", { month: "short", day: "2-digit" })
          : "TBA";
        const time = start
          ? start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
          : "TBA";

        return {
          id: t.slug || t.id,
          title,
          dateLabel,
          time,
          type: typeGuess,
          status,
          prize: Number(t.prize_pool ?? 0),
        };
      });

      const slugSet = new Set<string>(
        (ts ?? []).map((t: any) => String(t.slug ?? "")).filter(Boolean)
      );

      setRealJoined(mapped);
      setJoinedSlugSet(slugSet);
    })();
  }, [user]);

  async function saveProfileName() {
    if (!user) return;
    setNameMsg(null);
    setSavingName(true);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name.trim() || null })
      .eq("id", user.id);

    setSavingName(false);

    if (error) {
      setNameMsg(error.message);
      return;
    }

    setProfile((p) => (p ? { ...p, full_name: name.trim() || null } : p));
    setNameMsg("Saved ✅");
    setTimeout(() => setNameMsg(null), 1200);
  }

  async function changePassword() {
    setPassMsg(null);

    const p1 = newPass.trim();
    const p2 = confirmPass.trim();

    if (p1.length < 8) {
      setPassMsg("Password must be at least 8 characters.");
      return;
    }
    if (p1 !== p2) {
      setPassMsg("Passwords do not match.");
      return;
    }

    setPassLoading(true);

    const { error } = await supabase.auth.updateUser({ password: p1 });

    setPassLoading(false);

    if (error) {
      setPassMsg(error.message);
      return;
    }

    setNewPass("");
    setConfirmPass("");
    setPassMsg("Password updated ✅");
    setTimeout(() => setPassMsg(null), 1500);
  }

  // ✅ بيانات Dashboard تجريبية (مؤقتًا)
  const demo = useMemo(() => {
    const joined: DemoTournament[] = [
      { id: "daily-sprint", title: "Daily Sprint", dateLabel: "Feb 17", time: "7:00 PM", type: "Daily", status: "LIVE", prize: 1000 },
      { id: "friday-knockout", title: "Friday Knockout", dateLabel: "Feb 20", time: "8:00 PM", type: "Weekly", status: "UPCOMING", prize: 2500 },
      { id: "monthly-major", title: "Monthly Major", dateLabel: "Mar 01", time: "6:00 PM", type: "Monthly", status: "UPCOMING", prize: 10000 },
      { id: "weekend-rumble", title: "Weekend Rumble", dateLabel: "Feb 23", time: "5:00 PM", type: "Weekly", status: "UPCOMING", prize: 1500 },
    ];

    const won: DemoTournament[] = [
      { id: "daily-sprint", title: "Daily Sprint", dateLabel: "Feb 10", time: "7:00 PM", type: "Daily", status: "ENDED", prize: 1000 },
    ];

    const lost: DemoTournament[] = [
      { id: "weekly-challenge", title: "Weekly Challenge", dateLabel: "Feb 09", time: "8:00 PM", type: "Weekly", status: "ENDED", prize: 3000 },
      { id: "sunday-showdown", title: "Sunday Showdown", dateLabel: "Feb 02", time: "6:30 PM", type: "Weekly", status: "ENDED", prize: 2000 },
    ];

    const totalJoined = joined.length;
    const totalWon = won.length;
    const totalLost = lost.length;
    const winRate = totalJoined ? Math.round((totalWon / totalJoined) * 100) : 0;

    return { joined, won, lost, totalJoined, totalWon, totalLost, winRate };
  }, []);

  const joinedList = realJoined ?? demo.joined;
  const activeList = tab === "joined" ? joinedList : tab === "won" ? demo.won : demo.lost;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }
  if (!user) return null;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
        <div>
          <h1 className="text-3xl font-bold">Account Dashboard</h1>
          <p className="text-zinc-400 mt-2">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}. Track your tournaments & results.
          </p>
          {joinLoadErr && <p className="mt-2 text-sm text-red-400">Load error: {joinLoadErr}</p>}
        </div>

        <div className="flex items-center gap-2">
          {profile?.username ? (
            <Link
              href={`/members/${encodeURIComponent(profile.username)}`}
              className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition"
            >
              View Public Profile
            </Link>
          ) : (
            <span className="text-xs text-zinc-500">Add a username to enable public profile</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        <StatCard title="Tournaments joined" value={stats.joined} />
        <StatCard title="Wins" value={stats.won} />
        <StatCard title="Losses" value={stats.lost} />
        <StatCard title="Win rate" value={stats.joined ? `${Math.round((stats.won / stats.joined) * 100)}%` : "0%"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-sm text-zinc-400 mt-1">Update your public name for leaderboards.</p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm text-zinc-300">Full Name</label>
              <input
                className="mt-2 w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Email</label>
              <input
                className="mt-2 w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-zinc-400"
                value={user.email ?? ""}
                disabled
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={saveProfileName}
                disabled={savingName}
                className="bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold text-sm hover:bg-yellow-400 transition disabled:opacity-60"
              >
                {savingName ? "Saving..." : "Save changes"}
              </button>
              {nameMsg && <span className="text-sm text-zinc-300">{nameMsg}</span>}
            </div>

            <div className="text-xs text-zinc-500">User ID: {user.id}</div>
          </div>
        </section>

        <section className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3 flex-col sm:flex-row">
            <div>
              <h2 className="text-lg font-semibold">My tournaments</h2>
              <p className="text-sm text-zinc-400 mt-1">Joined, wins, and losses (demo now — next we connect real DB).</p>
            </div>

            <div className="flex items-center gap-2">
              <TabButton active={tab === "joined"} onClick={() => setTab("joined")}>Joined</TabButton>
              <TabButton active={tab === "won"} onClick={() => setTab("won")}>Won</TabButton>
              <TabButton active={tab === "lost"} onClick={() => setTab("lost")}>Lost</TabButton>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-400">
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 pr-4">Tournament</th>
                  <th className="text-left py-3 pr-4">Type</th>
                  <th className="text-left py-3 pr-4">Prize</th>
                  <th className="text-left py-3 pr-4">Status</th>
                  <th className="text-right py-3">Open</th>
                </tr>
              </thead>
              <tbody>
                {activeList.map((t) => (
                  <tr key={t.id} className="border-b border-zinc-800/70">
                    <td className="py-4 pr-4">
                      <div className="font-semibold text-white">{t.title}</div>
                      <div className="text-xs text-zinc-500">{t.dateLabel} • {t.time}</div>
                    </td>
                    <td className="py-4 pr-4 text-zinc-300">{t.type}</td>
                    <td className="py-4 pr-4 text-zinc-300">${Number(t.prize).toLocaleString()}</td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-zinc-700 text-xs text-zinc-200">
                          {t.status}
                        </span>
                        {tab === "joined" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-yellow-500 text-black text-[11px] font-bold">
                            REGISTERED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <Link href="/schedule" className="text-yellow-400 hover:underline">
                        View in schedule →
                      </Link>
                    </td>
                  </tr>
                ))}

                {activeList.length === 0 && (
                  <tr>
                    <td className="py-6 text-zinc-400" colSpan={5}>No items yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Security</h2>
          <p className="text-sm text-zinc-400 mt-1">Change your password.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <div>
              <label className="text-sm text-zinc-300">New password</label>
              <input
                className="mt-2 w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500"
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Confirm password</label>
              <input
                className="mt-2 w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500"
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Repeat password"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={changePassword}
              disabled={passLoading}
              className="bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold text-sm hover:bg-yellow-400 transition disabled:opacity-60"
            >
              {passLoading ? "Updating..." : "Update password"}
            </button>

            {passMsg && (
              <span className={`text-sm ${passMsg.includes("✅") ? "text-zinc-200" : "text-red-400"}`}>
                {passMsg}
              </span>
            )}
          </div>

          <div className="mt-3 text-xs text-zinc-500">
            Tip: If you use email confirmation / magic links later, we can add “Forgot password” too.
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="text-sm text-zinc-400">{title}</div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold text-sm"
          : "border border-zinc-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-900"
      }
    >
      {children}
    </button>
  );
}