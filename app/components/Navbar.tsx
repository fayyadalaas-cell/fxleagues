"use client";

import Link from "next/link";
import AuthButtons from "../AuthButtons";
import type { MouseEvent } from "react";

function closeMenu(e: MouseEvent<HTMLElement>) {
  const details = e.currentTarget.closest("details");
  if (details) details.removeAttribute("open");
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-900/70 bg-black/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-center shrink-0">
              <div className="h-2 w-2 rounded-full bg-yellow-400" />
            </div>

            <div className="leading-tight min-w-0">
              <div className="font-bold text-white truncate">Forex Leagues</div>
              <div className="text-xs text-zinc-400 truncate">
                Verified Forex Competitions
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
            <Link href="/schedule" className="hover:text-white">
              Schedule
            </Link>
            <Link href="/winners" className="hover:text-white">
              Winners
            </Link>
            <Link href="/brokers" className="hover:text-white">
              Brokers
            </Link>
            <Link href="/how-it-works" className="hover:text-white">
              How it works
            </Link>
            <Link href="/#sponsors" className="hover:text-white">
              Sponsors
            </Link>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-3">
              <AuthButtons />
            </div>

            <details className="md:hidden relative">
              <summary className="list-none cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm font-semibold text-white select-none">
                ☰
              </summary>

              <div className="absolute right-0 mt-2 z-50 w-[min(92vw,18rem)] rounded-xl border border-zinc-800 bg-black/95 shadow-xl p-2">
                <Link
                  href="/schedule"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                >
                  Schedule
                </Link>
                <Link
                  href="/winners"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                >
                  Winners
                </Link>
                <Link
                  href="/brokers"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                >
                  Brokers
                </Link>
                <Link
                  href="/how-it-works"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                >
                  How it works
                </Link>
                <Link
                  href="/#sponsors"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                >
                  Sponsors
                </Link>

                <div className="my-2 border-t border-zinc-800" />

                <div className="px-1 pb-1" onClick={closeMenu}>
                  <AuthButtons />
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}