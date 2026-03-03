import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./providers";
import { Suspense } from "react";
import VerifyEmailBanner from "./components/VerifyEmailBanner";
import Navbar from "./components/Navbar";
import NewsletterForm from "./components/NewsletterForm";

export const metadata: Metadata = {
  metadataBase: new URL("https://forexleagues.com"),

  title: {
    default: "FX Leagues | Forex Trading Contests & Leaderboards",
    template: "%s | FX Leagues",
  },

  description:
    "FX Leagues is a global forex trading contest platform. Join tournaments, climb live leaderboards, and win real prizes. Demo-first competitions built for transparency.",

  applicationName: "FX Leagues",
  creator: "FX Leagues",
  publisher: "FX Leagues",

  keywords: [
    "forex trading contest",
    "forex competition",
    "trading tournaments",
    "demo trading contest",
    "forex leaderboard",
    "trading contest platform",
    "forex tournaments",
    "trading leaderboard",
    "forex contest",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "FX Leagues | Forex Trading Contests & Leaderboards",
    description:
      "Join global forex tournaments, compete on live leaderboards, and win real prizes.",
    url: "https://forexleagues.com",
    siteName: "FX Leagues",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FX Leagues - Forex Trading Contests",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "FX Leagues | Forex Trading Contests & Leaderboards",
    description:
      "Compete in global forex trading contests and win real prizes.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

function Footer() {
  return (
    <footer className="relative bg-zinc-950 border-t border-zinc-800">
      <div className="pointer-events-none absolute -top-12 left-0 right-0 h-12 bg-gradient-to-b from-yellow-500/10 to-transparent blur-2xl" />
      <div className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/25 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-2">
        <div
          className="
            grid grid-cols-1 items-start gap-y-8
            md:grid-cols-[1.1fr_0.8fr_0.8fr_1.1fr]
            md:gap-x-6 md:gap-y-10
          "
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
              </div>
              <div className="text-lg font-extrabold text-white">
                Forex Leagues
              </div>
            </div>

            <p className="text-sm text-zinc-400 mt-4 leading-relaxed max-w-[340px] md:max-w-[260px]">
              Competitive trading tournaments built for performance,
              transparency, and growth.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:contents">
            <div className="md:justify-self-start">
              <div className="text-sm font-semibold mb-3 text-white">
                Platform
              </div>
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

            <div className="md:justify-self-start">
              <div className="text-sm font-semibold mb-3 text-white">
                Company
              </div>
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
          </div>

          <div className="w-full md:justify-self-end md:w-[460px]">
            <div className="rounded-2xl border border-yellow-500/20 bg-zinc-900/25 px-4 py-4 md:px-6 md:py-5 shadow-[0_0_0_1px_rgba(250,204,21,0.06)]">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">
                  Newsletter
                </div>
                <div className="hidden md:block text-[11px] text-zinc-500">
                  Updates
                </div>
              </div>

              <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
                Tournament updates and announcements.
              </p>

              <NewsletterForm />

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

        <div className="mt-5 border-t border-zinc-900 pt-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-xs text-zinc-400">
              © {new Date().getFullYear()}{" "}
              <span className="text-white font-semibold">
                Forex Leagues
              </span>. All rights reserved.
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
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