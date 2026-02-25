"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function VerifyEmailBanner() {
  const searchParams = useSearchParams();

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  const [message, setMessage] = useState(
    "Please verify your email to join tournaments."
  );

  useEffect(() => {
    async function run() {
      // 1) لو الرابط فيه ?verify=1 (بعد التسجيل) خلّيه يطلع
      const forced = searchParams.get("verify") === "1";

      // 2) افحص المستخدم الحالي
      const { data } = await supabase.auth.getUser();
      const user = data?.user ?? null;

      setHasUser(!!user);

      // إذا الحساب Verified → لا نعرض البنر
      if (user?.email_confirmed_at) {
        setShow(false);
        return;
      }

      // إذا عنده user ومش verified → اعرض البنر دائمًا
      if (user && !user.email_confirmed_at) {
        setMessage("Your account is not verified yet. Please verify your email to join tournaments.");
        setShow(true);
        return;
      }

      // إذا ما في user (مش مسجّل دخول) → اعرض البنر فقط لو forced
      if (forced) {
        setMessage("Account created. Please verify your email to join tournaments.");
        setShow(true);
        return;
      }

      setShow(false);
    }

    run();
  }, [searchParams]);

  async function resendVerification() {
    setLoading(true);

    const { data } = await supabase.auth.getUser();
    const email = data?.user?.email;

    if (!email) {
      setMessage("Please sign in first, then you can resend the verification email.");
      setLoading(false);
      return;
    }

    await supabase.auth.resend({ type: "signup", email });

    setMessage("Verification email sent again. Please check your inbox (including spam).");
    setLoading(false);
  }

  if (!show) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 pt-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm">
        <div className="mb-3 text-white">{message}</div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={resendVerification}
            disabled={loading || !hasUser}
            className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black hover:bg-yellow-400 transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "Resend verification email"}
          </button>

          <button
            onClick={() => setShow(false)}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-200 hover:bg-zinc-800 transition"
          >
            Close
          </button>
        </div>

        {!hasUser && (
          <div className="mt-2 text-xs text-zinc-400">
            Tip: Sign in to enable “Resend verification email”.
          </div>
        )}
      </div>
    </div>
  );
}