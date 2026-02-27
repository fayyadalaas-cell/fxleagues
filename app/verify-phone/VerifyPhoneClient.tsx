"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

function clean(v: string) {
  return v.replace(/[\s\u00A0\u200B\u200C\u200D]/g, "").trim();
}

export default function VerifyPhoneClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const [step, setStep] = useState<"send" | "verify">("send");
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      const p = (u?.user_metadata?.phone as string | undefined) || "";
      if (p) setPhone(clean(p));
    })();
  }, []);

  async function sendCode() {
    setErrorMsg(null);
    setInfoMsg(null);

    const p = clean(phone);
    if (!p || !p.startsWith("+")) {
      setErrorMsg("Please enter a valid phone with country code (e.g. +1...).");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: p });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setInfoMsg("Verification code sent to your phone.");
    setStep("verify");
  }

  async function verifyCode() {
    setErrorMsg(null);
    setInfoMsg(null);

    const p = clean(phone);
    const c = clean(code);

    if (!c || c.length < 4) {
      setErrorMsg("Please enter the code you received.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      phone: p,
      token: c,
      type: "sms",
    });

    if (error) {
      setLoading(false);
      setErrorMsg(error.message);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").update({ phone_verified: true }).eq("id", userId);
    }

    setLoading(false);
    setInfoMsg("Phone verified successfully. Redirecting...");

    setTimeout(() => {
      router.push(next);
      router.refresh();
    }, 600);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
        <Link href="/" className="text-yellow-400 hover:underline text-sm">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold mt-4">Verify your phone</h1>
        <p className="text-zinc-400 mt-2">
          Enter the code sent to your phone to activate your account.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-zinc-300">Phone</label>
            <input
              className="mt-2 w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+14165551234"
              disabled={step === "verify"}
            />
          </div>

          {step === "verify" && (
            <div>
              <label className="text-sm text-zinc-300">Code</label>
              <input
                className="mt-2 w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
              />
            </div>
          )}

          {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
          {infoMsg && <div className="text-green-400 text-sm">{infoMsg}</div>}

          {step === "send" ? (
            <button
              onClick={sendCode}
              disabled={loading}
              className="w-full bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send code"}
            </button>
          ) : (
            <button
              onClick={verifyCode}
              disabled={loading}
              className="w-full bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}