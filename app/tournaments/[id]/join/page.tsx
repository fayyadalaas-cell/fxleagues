"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function JoinTournamentPage() {
  const params = useParams();
  const router = useRouter();

  // URL param: could be "daily-sprint" OR "daily-sprint-0217"
  const tournamentSlug = (params?.id as string) || "";

  // ✅ Normalize: remove trailing numeric suffix after last dash
  // daily-sprint-0217 -> daily-sprint
  const baseSlug = useMemo(
    () => tournamentSlug.replace(/-\d+$/, ""),
    [tournamentSlug]
  );

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [resending, setResending] = useState(false);

  // ✅ NEW: agreement checkbox
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user ?? null;

      if (sessionUser) {
        setUser(sessionUser);
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
      setLoading(false);
    };

    checkUser();
  }, []);

  // helper: "daily-sprint" -> "Daily Sprint"
  const toTitleGuess = (s: string) =>
    s
      .replace(/-/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const handleJoin = async () => {
    setMessage(null);

    // ✅ NEW: require agreement before joining
    if (!agreed) {
      setMessage("Please agree to the Terms & Conditions and Privacy Policy to continue.");
      return;
    }

    if (!user) {
      setMessage("Please sign in to join this tournament.");
      return;
    }

    if (!user.email_confirmed_at) {
      setMessage("Your account is not verified yet. Please verify your email before joining.");
      return;
    }

    if (!user.email_confirmed_at) {
      setMessage("Please verify your email before joining tournaments.");
      return;
    }

    if (!baseSlug) {
      setMessage("Invalid tournament link.");
      return;
    }

    setJoining(true);

    try {
      let tournamentUuid: string | null = null;

      // ✅ 1) Primary: find tournament by baseSlug (exact)
      {
        const { data: tRow, error: tErr } = await supabase
          .from("tournaments")
          .select("id, slug, title")
          .eq("slug", baseSlug)
          .single();

        if (!tErr && tRow?.id) tournamentUuid = tRow.id;
      }

      // ✅ 2) Fallback: find by title contains guess (ILIKE)
      if (!tournamentUuid) {
        const guessTitle = toTitleGuess(baseSlug);

        const { data: rows, error } = await supabase
          .from("tournaments")
          .select("id, slug, title")
          .ilike("title", `%${guessTitle}%`)
          .limit(1);

        if (!error && rows && rows.length > 0) {
          tournamentUuid = rows[0].id;
        }
      }

      // ✅ 3) Still not found
      if (!tournamentUuid) {
        setMessage(
          `Tournament not found in DB. Expected slug="${baseSlug}" or title like "${toTitleGuess(
            baseSlug
          )}".`
        );
        setJoining(false);
        return;
      }

      // ✅ 4) Join via RPC (single source of truth)
      const { error } = await supabase.rpc("join_tournament", {
        p_tournament_id: tournamentUuid,
      });

      setJoining(false);

      if (error) {
          if ((error as any).code === "23505") {
           setMessage("You are already registered in this tournament.");
           } else if (error.message?.includes("banned")) {
             setMessage("Your account has been restricted. Please contact support.");
           } else if (error.message?.includes("closed")) {
            setMessage("This tournament is closed.");
           } else if (error.message?.includes("not found")) {
            setMessage("Tournament not found.");
           } else {
           setMessage("Unable to join the tournament. Please try again later.");
           }
           return;
              }

      setMessage("Successfully joined the tournament ✅");
      // ✅ نرجع للتفاصيل على baseSlug (عشان ما يصير mismatch مع suffix)
      setTimeout(() => router.push(`/tournaments/${baseSlug || tournamentSlug}`), 800);
    } catch (e: any) {
      setJoining(false);
      setMessage(`Join failed: ${e?.message ?? "Unknown error"}`);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-zinc-400">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-zinc-900 rounded-xl p-8 border border-zinc-800">
        <Link
          href={`/tournaments/${baseSlug || tournamentSlug}`}
          className="text-yellow-400 text-sm hover:underline"
        >
          ← Back to Details
        </Link>

        <h1 className="text-2xl font-bold mt-4 mb-6">Join Tournament</h1>

        {!user ? (
          <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg">
            <p className="text-red-400 mb-4">You must sign in before joining.</p>

            <div className="flex gap-3">
              <Link
                href="/signin"
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold"
              >
                Sign In
              </Link>

              <Link
                href={`/tournaments/${baseSlug || tournamentSlug}`}
                className="bg-zinc-700 px-4 py-2 rounded-lg"
              >
                Back
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* ✅ NEW: Terms/Privacy agreement (single checkbox) */}
            <div className="mb-4 rounded-lg border border-zinc-700 bg-zinc-800 p-4">
              <label className="flex items-start gap-3 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-yellow-500"
                />
                <span>
                  I agree to the{" "}
                  <a href="/terms" className="text-yellow-400 hover:underline">
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-yellow-400 hover:underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
            </div>

            {/* 🔒 Email not verified warning */}
            {user && !user.email_confirmed_at && (
              <div className="mb-4 rounded-lg border border-zinc-700 bg-zinc-800 p-4">
                <div className="text-sm text-zinc-200">
                  Your email is not verified yet. Please verify your email before joining tournaments.
                </div>

                <button
                  onClick={async () => {
                    setResending(true);
                    const email = user?.email;
                    if (email) {
                      await supabase.auth.resend({
                        type: "signup",
                        email,
                      });
                      setMessage(
                        "Verification email sent again. Please check your inbox (including spam)."
                      );
                    }
                    setResending(false);
                  }}
                  disabled={resending}
                  className="mt-3 rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black hover:bg-yellow-400 transition disabled:opacity-60"
                >
                  {resending ? "Sending..." : "Resend verification email"}
                </button>
              </div>
            )}

            <button
              onClick={handleJoin}
              disabled={joining || (user && !user.email_confirmed_at) || !agreed}
              className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-lg hover:bg-yellow-400 transition disabled:opacity-60"
            >
              {joining ? "Joining..." : "Confirm Join"}
            </button>

            {message && (
  <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-100">
    {message}
  </div>
)}
          </div>
        )}

        <div className="mt-6 text-xs text-zinc-500">
  By joining this tournament, you confirm that you meet the eligibility requirements 
  and agree to comply with the platform’s Terms & Conditions. 
  Trading involves risk and may not be suitable for all participants.
</div>
      </div>
    </main>
  );
}