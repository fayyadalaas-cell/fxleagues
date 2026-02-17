import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "./providers";
import AuthButtons from "./AuthButtons";

export const metadata: Metadata = {
  title: "FX Leagues",
  description: "Competitive trading tournaments and performance leaderboards.",
};

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-900/70 bg-black/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-yellow-400" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-white">FX Leagues</div>
            <div className="text-xs text-zinc-400">Competitions • Leaderboards</div>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
          <Link href="/schedule" className="hover:text-white">Schedule</Link>
          <Link href="/leaderboards" className="hover:text-white">Leaderboards</Link>
          <Link href="/brokers" className="hover:text-white">Brokers</Link>
          <Link href="/how-it-works" className="hover:text-white">How it works</Link>
          <Link href="/#sponsors" className="hover:text-white">Sponsors</Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-900/70 bg-black">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
              </div>
              <div className="text-lg font-extrabold text-white">FX Leagues</div>
            </div>

            <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
              Competitive trading tournaments built for performance, transparency, and growth.
            </p>
          </div>

          {/* Platform */}
          <div>
            <div className="text-sm font-semibold mb-3 text-white">Platform</div>
            <div className="flex flex-col gap-2 text-sm text-zinc-300">
              <Link href="/schedule" className="hover:text-white transition">Schedule</Link>
              <Link href="/leaderboards" className="hover:text-white transition">Leaderboards</Link>
              <Link href="/how-it-works" className="hover:text-white transition">How it works</Link>
              <Link href="/brokers" className="hover:text-white transition">Brokers</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <div className="text-sm font-semibold mb-3 text-white">Company</div>
            <div className="flex flex-col gap-2 text-sm text-zinc-300">
              <Link href="/about" className="hover:text-white transition">About</Link>
              <Link href="/contact" className="hover:text-white transition">Contact</Link>
              <Link href="/terms" className="hover:text-white transition">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            </div>
          </div>

          {/* CTA */}
          <div>
            <div className="text-sm font-semibold mb-3 text-white">Ready to compete?</div>
            <Link
              href="/schedule"
              className="inline-flex items-center justify-center bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold text-sm hover:bg-yellow-400 transition"
            >
              View tournaments
            </Link>
            <div className="mt-4 text-xs text-zinc-400">
              Demo-first today. Paid entry & broker integrations later.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-zinc-900 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-xs text-zinc-400">
            © {new Date().getFullYear()} <span className="text-white font-semibold">FX Leagues</span>. All rights reserved.
          </div>

          <div className="text-xs text-zinc-500">
            Risk warning: Trading involves risk. This platform is competition-focused and demo-first.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
