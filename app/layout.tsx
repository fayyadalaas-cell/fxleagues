import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./providers";
import { Suspense } from "react";
import VerifyEmailBanner from "./components/VerifyEmailBanner";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "Forex Leagues",
  description: "Competitive trading tournaments and performance leaderboards.",
  robots: { index: false, follow: false },
};

function Footer() {
  return (
    <footer className="relative bg-zinc-950 border-t border-zinc-800">
      {/* subtle top glow like the sections */}
      <div className="pointer-events-none absolute -top-12 left-0 right-0 h-12 bg-gradient-to-b from-yellow-500/10 to-transparent blur-2xl" />
      <div className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/25 to-transparent" />

      {/* ✅ IMPORTANT: make footer same width as site */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
              </div>
              <div className="text-lg font-extrabold text-white">Forex Leagues</div>
            </div>

            <p className="text-sm text-zinc-400 mt-4 leading-relaxed max-w-xs">
              Competitive trading tournaments built for performance, transparency, and growth.
            </p>
          </div>

          {/* Platform */}
          <div>
            <div className="text-sm font-semibold mb-3 text-white">Platform</div>
            <div className="flex flex-col gap-2 text-sm text-zinc-300">
              <a href="/schedule" className="hover:text-white transition">Schedule</a>
              <a href="/winners" className="hover:text-white transition">Winners</a>
              <a href="/how-it-works" className="hover:text-white transition">How it works</a>
              <a href="/brokers" className="hover:text-white transition">Brokers</a>
            </div>
          </div>

          {/* Company */}
          <div>
            <div className="text-sm font-semibold mb-3 text-white">Company</div>
            <div className="flex flex-col gap-2 text-sm text-zinc-300">
              <a href="/about" className="hover:text-white transition">About</a>
              <a href="/contact" className="hover:text-white transition">Contact</a>
              <a href="/terms" className="hover:text-white transition">Terms</a>
              <a href="/privacy" className="hover:text-white transition">Privacy</a>
            </div>
          </div>

          {/* CTA (aligned properly) */}
          <div className="md:text-right md:justify-self-end">
            <div className="text-sm font-semibold mb-3 text-white">Ready to compete?</div>

            <a
              href="/schedule"
              className="inline-flex items-center justify-center bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold text-sm hover:bg-yellow-400 transition"
            >
              View tournaments
            </a>

            <div className="mt-4 text-xs text-zinc-400 max-w-xs md:ml-auto">
              Demo-first today. Paid entry & broker integrations later.
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-10 md:mt-12 border-t border-zinc-900 pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-xs text-zinc-400">
              © {new Date().getFullYear()}{" "}
              <span className="text-white font-semibold">Forex Leagues</span>. All rights reserved.
            </div>

            <div className="text-xs text-zinc-500 md:text-right">
              Trading involves risk. This platform is competition-focused and demo-first.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <AuthProvider>
          <Navbar />

          <Suspense fallback={null}>
            <VerifyEmailBanner />
          </Suspense>

          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}