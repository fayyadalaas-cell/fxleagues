"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const v = email.trim().toLowerCase();
    if (!v) {
      setMsg("⚠️ Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: v, source: "footer" }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.ok) {
        setMsg("✅ Thanks for subscribing! You'll hear from us soon.");
        setEmail("");
      } else if (res.status === 400) {
        setMsg("⚠️ Please enter a valid email.");
      } else {
        setMsg("⚠️ Something went wrong. Please try again.");
      }
    } catch {
      setMsg("⚠️ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full sm:flex-1 rounded-xl border border-zinc-800 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-yellow-500/60"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 transition disabled:opacity-60 disabled:hover:bg-yellow-500"
        >
          {loading ? "..." : "Subscribe"}
        </button>
      </div>

      {msg && <div className="mt-2 text-xs text-zinc-300">{msg}</div>}
    </form>
  );
}