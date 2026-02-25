"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user ?? null;

      setEmail(user?.email ?? null);
      setVerified(!!user?.email_confirmed_at);
    }
    load();
  }, []);

  async function resend() {
    setLoading(true);
    setMsg(null);

    const { data } = await supabase.auth.getUser();
    const userEmail = data?.user?.email;

    if (!userEmail) {
      setMsg("Please sign in first, then you can resend the verification email.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resend({ type: "signup", email: userEmail });
    if (error) setMsg(error.message);
    else setMsg("Verification email sent. Please check your inbox (including spam).");

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
        <h1 className="text-3xl font-bold">Verify your email</h1>

        {verified ? (
          <p className="text-zinc-300 mt-3">
            Your email is verified ✅ You can now join tournaments.
          </p>
        ) : (
          <>
            <p className="text-zinc-400 mt-3">
              We sent a verification link to{email ? ` ${email}` : " your email"}.
              Please verify your email to activate your account and join tournaments.
            </p>

            <button
              onClick={resend}
              disabled={loading}
              className="mt-6 w-full bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Resend verification email"}
            </button>

            {msg && <div className="mt-3 text-sm text-zinc-200">{msg}</div>}
          </>
        )}

        <Link href="/" className="mt-6 inline-block text-yellow-400 hover:underline text-sm">
          Continue to Home
        </Link>
      </div>
    </main>
  );
}