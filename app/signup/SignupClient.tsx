"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { PhoneInput } from "react-international-phone";
import { supabase } from "../../lib/supabase/client";

function normalizeUsername(v: string) {
  return v.trim().toLowerCase();
}

function validateUsername(v: string) {
  const u = normalizeUsername(v);

  if (u.length < 3) return "Username must be at least 3 characters.";
  if (u.length > 10) return "Username must be 10 characters or less.";
  if (!/^[a-z0-9_]+$/.test(u))
    return "Username can only contain a-z, 0-9, and underscores (_).";
  if (u.startsWith("_") || u.endsWith("_"))
    return "Username cannot start or end with underscore.";
  if (/__/.test(u)) return "Username cannot contain consecutive underscores.";

  return null;
}

function cleanInvisibleChars(v: string) {
  return v.replace(/[\s\u00A0\u200B\u200C\u200D]/g, "").trim();
}

// E.164
function validatePhone(v: string) {
  const p = cleanInvisibleChars(v);

  if (p.length === 0) return "Phone is required.";
  if (!p.startsWith("+")) return "Phone must include a country code (e.g. +1).";
  if (!/^\+[1-9]\d{7,14}$/.test(p)) return "Enter a valid phone number.";
  return null;
}

function validatePassword(v: string) {
  if (v.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(v))
    return "Password must include at least 1 uppercase letter.";
  if (!/[a-z]/.test(v))
    return "Password must include at least 1 lowercase letter.";
  if (!/[0-9]/.test(v)) return "Password must include at least 1 number.";
  return null;
}

export default function SignupClient({ nextUrl }: { nextUrl: string }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [touched, setTouched] = useState({
    username: false,
    phone: false,
    password: false,
  });
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const usernameError = useMemo(() => validateUsername(username), [username]);
  const phoneError = useMemo(() => validatePhone(phone), [phone]);
  const passwordError = useMemo(() => validatePassword(password), [password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSubmittedOnce(true);

    const uErr = validateUsername(username);
    if (uErr) return setErrorMsg(uErr);

    const pErr = validatePhone(phone);
    if (pErr) return setErrorMsg(pErr);

    const pwErr = validatePassword(password);
    if (pwErr) return setErrorMsg(pwErr);

    setLoading(true);

    const cleanUsername = normalizeUsername(username);
    const cleanPhone = cleanInvisibleChars(phone);

    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://forexleagues.com";

    const safeNext = nextUrl && nextUrl.length > 0 ? nextUrl : "/";

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // ✅ هذا أهم سطر
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
          safeNext
        )}`,
        data: {
          full_name: name.trim(),
          username: cleanUsername,
          phone: cleanPhone,
        },
      },
    });

    if (error) {
  setLoading(false);
  setErrorMsg(error.message);
  return;
}

// ✅ حاليا: تحقق عبر الإيميل فقط
router.push(`/verify-email?next=${encodeURIComponent(safeNext)}`);
router.refresh();
setLoading(false);
  }

  const showUsernameError =
    (touched.username || submittedOnce) && !!usernameError;
  const showPhoneError = (touched.phone || submittedOnce) && !!phoneError;
  const showPasswordError =
    (touched.password || submittedOnce) && !!passwordError;

  const hasAnyError = Boolean(usernameError || phoneError || passwordError);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
        <Link href="/" className="text-yellow-400 hover:underline text-sm">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold mt-4">Create Account</h1>
        <p className="text-zinc-400 mt-2">
          Create your FX Leagues account to join competitions.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-zinc-300">Full Name</label>
            <input
              className="mt-2 w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300">Username</label>
            <input
              className="mt-2 w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, username: true }))}
              placeholder="e.g. alaa_fx"
              maxLength={10}
              autoComplete="username"
              required
            />
            {showUsernameError && (
              <div className="text-zinc-400 text-xs mt-2">{usernameError}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-zinc-300">Phone</label>

            <div className="mt-2">
              <PhoneInput
                defaultCountry="ca"
                value={phone}
                onChange={(value) => setPhone(cleanInvisibleChars(value))}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                inputClassName="w-full !bg-black !text-white !border !border-zinc-700 !rounded-lg !px-4 !py-3 !outline-none focus:!border-yellow-500 !h-[48px]"
                countrySelectorStyleProps={{
                  buttonClassName:
                    "!bg-black !border !border-zinc-700 !rounded-lg !h-[48px] !w-[56px] !px-2 !flex !items-center !justify-center",
                  dropdownStyleProps: {
                    className:
                      "!bg-zinc-900 !text-white !border !border-zinc-700",
                  },
                }}
              />
            </div>

            {showPhoneError && (
              <div className="text-zinc-400 text-xs mt-2">{phoneError}</div>
            )}
          </div>

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
            <label className="text-sm text-zinc-300">Password</label>
            <input
              className="mt-2 w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              autoComplete="new-password"
              required
            />
            {showPasswordError && (
              <div className="text-zinc-400 text-xs mt-2">{passwordError}</div>
            )}
          </div>

          {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}

          <button
            disabled={loading || hasAnyError}
            className="w-full bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="text-sm text-zinc-400 mt-4">
          Already have an account?{" "}
          <Link
            href={`/signin?next=${encodeURIComponent(nextUrl || "/")}`}
            className="text-yellow-400 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}