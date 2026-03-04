"use client";

import { useMemo, useState } from "react";

type Props = {
  tournamentSlug: string;
  refCode?: string; // مثل username أو userId (اختياري)
};

export default function InviteFriend({ tournamentSlug, refCode }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteUrl = useMemo(() => {
    const base =
      typeof window !== "undefined" ? window.location.origin : "https://fxleagues.com";
    const url = new URL(`${base}/tournaments/${tournamentSlug}`);
    if (refCode) url.searchParams.set("ref", refCode);
    return url.toString();
  }, [tournamentSlug, refCode]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = inviteUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

 const message = `Join this Forex Leagues tournament:

${inviteUrl}`;

const encMessage = encodeURIComponent(message);
const encUrl = encodeURIComponent(inviteUrl);

// X
const xShare = `https://x.com/intent/tweet?text=${encMessage}`;

// Facebook
const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`;

// Telegram
const telegramShare = `https://t.me/share/url?url=${encUrl}&text=${encodeURIComponent(
  "Join this tournament on Forex Leagues"
)}`;

// WhatsApp
const whatsapp = `https://wa.me/?text=${encMessage}`;

  return (
    <>
      {/* ✅ زر واضح + بالنص + Full width */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full h-11 rounded-xl border border-zinc-700 bg-black/20 text-sm font-semibold text-white hover:bg-zinc-900 transition flex items-center justify-center"
      >
        Invite a friend
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />

          {/* box */}
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-extrabold">Invite friends</div>
                <div className="text-sm text-zinc-400 mt-1">
                  Share this tournament with your friends
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Link box */}
            <div className="mt-4 rounded-xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500 mb-2">Invite link</div>
              <div className="text-sm text-zinc-200 break-all">{inviteUrl}</div>
            </div>

            {/* actions */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={copyLink}
                className="h-11 bg-yellow-500 text-black rounded-xl font-extrabold hover:brightness-95 transition"
              >
                {copied ? "Copied ✅" : "Copy link"}
              </button>

              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="h-11 flex items-center justify-center rounded-xl border border-zinc-700 bg-black/20 text-white font-bold hover:bg-zinc-900 transition"
              >
                WhatsApp
              </a>
            </div>

            {/* social */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <a
                href={facebookShare}
                target="_blank"
                rel="noreferrer"
                className="text-center h-11 flex items-center justify-center border border-zinc-700 rounded-xl hover:bg-zinc-900 transition"
              >
                Facebook
              </a>

              <a
                href={xShare}
                target="_blank"
                rel="noreferrer"
                className="text-center h-11 flex items-center justify-center border border-zinc-700 rounded-xl hover:bg-zinc-900 transition"
              >
                X
              </a>
            </div>

            <div className="mt-4 text-xs text-zinc-500">
              Tip: share it in trading groups to get more participants.
            </div>
          </div>
        </div>
      )}
    </>
  );
}