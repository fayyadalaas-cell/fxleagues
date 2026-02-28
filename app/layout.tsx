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

      {/* Same width as site */}
      <div className="max-w-7xl mx-auto px-6 py-10">
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
              <a href="/schedule" className="hover:text-white transition">
                Schedule
              </a>
              <a href="/winners" className="hover:text-white transition">
                Winners
              </a>
              <a href="/how-it-works" className="hover:text-white transition">
                How it works
              </a>
              <a href="/brokers" className="hover:text-white transition">
                Brokers
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <div className="text-sm font-semibold mb-3 text-white">Company</div>
            <div className="flex flex-col gap-2 text-sm text-zinc-300">
              <a href="/about" className="hover:text-white transition">
                About
              </a>
              <a href="/contact" className="hover:text-white transition">
                Contact
              </a>
              <a href="/terms" className="hover:text-white transition">
                Terms &amp; Conditions
              </a>
              <a href="/privacy" className="hover:text-white transition">
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Newsletter — compact + aligned + more visible (NO handlers) */}
          <div className="w-full md:justify-self-end">
            <div className="rounded-2xl border border-yellow-500/20 bg-zinc-900/25 px-5 py-4 shadow-[0_0_0_1px_rgba(250,204,21,0.06)]">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Newsletter</div>
                <div className="hidden md:block text-[11px] text-zinc-500">
                  Updates
                </div>
              </div>

              <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
                Tournament updates and announcements.
              </p>

              {/* Server-safe: form بدون onSubmit (يروح لـ /contact مع الإيميل كـ query) */}
              <form action="/contact" method="get" className="mt-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="w-full sm:flex-1 rounded-xl border border-zinc-800 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-yellow-500/60"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 transition"
                  >
                    Subscribe
                  </button>
                </div>
              </form>

              <div className="mt-2 text-xs text-zinc-500">
                By subscribing, you agree to our{" "}
                <a href="/privacy" className="text-yellow-400 hover:underline">
                  Privacy Policy
                </a>
                .
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-8 border-t border-zinc-900 pt-6">
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