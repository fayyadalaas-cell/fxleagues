"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function SignInClient({ nextUrl = "/" }: { nextUrl?: string }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (!data.session) {
      setErrorMsg("Please verify your email first, then try signing in again.");
      return;
    }

    // ✅ التحويل الصحيح: إذا nextUrl موجود استخدمه، غير هيك روح /account
    const target = nextUrl && nextUrl !== "/" ? nextUrl : "/account";

    // أفضل للثبات مع Next/Supabase sessions
    window.location.href = target;
  }

  async function handleForgotPassword() {
    setErrorMsg(null);
    setInfoMsg(null);

    const e = email.trim();
    if (!e) {
      setErrorMsg("Please enter your email first.");
      return;
    }

    setResetLoading(true);

    // ✅ لازم يكون عندك صفحة تستقبل reset flow
    const redirectTo = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(e, {
      redirectTo,
    });

    setResetLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setInfoMsg("Password reset email sent. Please check your inbox.");
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
        <Link href="/" className="text-yellow-400 hover:underline text-sm">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold mt-4">Sign in</h1>
        <p className="text-zinc-400 mt-2">
          Sign in to access your FX Leagues account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-zinc-300">Email</label>
            <input
              className="mt-2 w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-zinc-300">Password</label>

              {/* ✅ Forgot password */}
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="text-xs text-yellow-400 hover:underline disabled:opacity-60"
              >
                {resetLoading ? "Sending..." : "Forgot password?"}
              </button>
            </div>

            <input
              className="mt-2 w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
          {infoMsg && <div className="text-green-400 text-sm">{infoMsg}</div>}

          <button
            disabled={loading}
            className="w-full bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="text-sm text-zinc-400 mt-4">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(nextUrl || "/")}`}
            className="text-yellow-400 hover:underline"
          >
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
}