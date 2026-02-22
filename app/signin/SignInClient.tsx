"use client";

import Link from "next/link";
import React, { useState } from "react";
import { supabase } from "../../lib/supabase/client";

export default function SignInClient({ nextUrl = "/" }: { nextUrl?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data.session && data.user) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || null,
        });
      }

      const target =
        nextUrl && nextUrl !== "/" ? nextUrl : "/admin";

      // Reload كامل يثبت الجلسة 100%
      window.location.assign(target);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
        <Link href="/" className="text-yellow-400 hover:underline text-sm">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold mt-4">Sign in</h1>
        <p className="text-zinc-400 mt-2">Sign in using your account.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-zinc-300">Email</label>
            <input
              className="mt-2 w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300">Password</label>
            <input
              className="mt-2 w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMsg && (
            <div className="text-red-500 text-sm">{errorMsg}</div>
          )}

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
            href={`/signup?next=${encodeURIComponent(
              nextUrl || "/"
            )}`}
            className="text-yellow-400 hover:underline"
          >
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
}