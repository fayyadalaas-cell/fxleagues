"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

function validatePassword(v: string) {
  if (v.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(v)) return "Password must include at least 1 uppercase letter.";
  if (!/[a-z]/.test(v)) return "Password must include at least 1 lowercase letter.";
  if (!/[0-9]/.test(v)) return "Password must include at least 1 number.";
  return null;
}

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordError = useMemo(() => validatePassword(password), [password]);
  const confirmError = useMemo(() => {
    if (!confirm) return null;
    if (confirm !== password) return "Passwords do not match.";
    return null;
  }, [confirm, password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const pErr = validatePassword(password);
    if (pErr) return setErrorMsg(pErr);

    if (confirm !== password) {
      return setErrorMsg("Passwords do not match.");
    }

    setLoading(true);

    // ✅ Supabase will allow this ONLY if the user came via recovery link
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      // غالباً: الرابط منتهي/غير صالح أو ما في session recovery
      setErrorMsg(error.message || "Reset link is invalid or expired. Please try again.");
      return;
    }

    setInfoMsg("Password updated successfully. Redirecting to sign in...");

    // ✅ نرجع المستخدم لتسجيل الدخول
    setTimeout(() => {
      router.push("/signin");
      router.refresh();
    }, 900);
  }

  const hasAnyError = Boolean(passwordError || confirmError);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
        <Link href="/" className="text-yellow-400 hover:underline text-sm">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold mt-4">Reset password</h1>
        <p className="text-zinc-400 mt-2">
          Choose a new password for your FX Leagues account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-zinc-300">New password</label>
            <input
              className="mt-2 w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            {passwordError && (
              <div className="text-zinc-400 text-xs mt-2">{passwordError}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-zinc-300">Confirm password</label>
            <input
              className="mt-2 w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
            {confirmError && (
              <div className="text-zinc-400 text-xs mt-2">{confirmError}</div>
            )}
          </div>

          {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
          {infoMsg && <div className="text-green-400 text-sm">{infoMsg}</div>}

          <button
            disabled={loading || hasAnyError}
            className="w-full bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <div className="text-sm text-zinc-400 mt-4">
          Remembered your password?{" "}
          <Link href="/signin" className="text-yellow-400 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}