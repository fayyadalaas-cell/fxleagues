"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    // إذا Supabase عنده Email confirmation مفعّل:
    // session ممكن تكون null لحد ما يأكد الإيميل.
    if (data.session) {
      router.push(next);
      return;
    }

    setSuccessMsg(
      "Account created. Please check your email to confirm your account, then sign in."
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
        <Link href="/" className="text-yellow-400 hover:underline text-sm">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold mt-4">Create Account</h1>
        <p className="text-zinc-400 mt-2">
          Create a real account using Supabase Auth.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-zinc-300">Full Name</label>
            <input
              className="mt-2 w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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

          {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
          {successMsg && <div className="text-green-400 text-sm">{successMsg}</div>}

          <button
            disabled={loading}
            className="w-full bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="text-sm text-zinc-400 mt-4">
          Already have an account?{" "}
          <Link
            href={`/signin?next=${encodeURIComponent(next)}`}
            className="text-yellow-400 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
