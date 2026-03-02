"use client";

import Link from "next/link";
import Image from "next/image";

type Broker = {
  key: "exness" | "icmarkets" | "vantage" | "fxtm";
  name: string;
  logo: string;
  regulated: string;
  minDeposit: string;
  spreadFrom: string;
  platforms: string;
  short: string;
  demoUrl: string; // مؤقتاً
  realUrl: string; // مؤقتاً
};

const BROKERS: Broker[] = [
  {
    key: "exness",
    name: "Exness",
    logo: "/brokers/exness.png",
    regulated: "FCA / CySEC (varies by region)",
    minDeposit: "$10+",
    spreadFrom: "0.0 pips",
    platforms: "MT4 / MT5",
    short: "Fast execution and flexible account types.",
    demoUrl: "#",
    realUrl: "#",
  },
  {
    key: "icmarkets",
    name: "IC Markets",
    logo: "/brokers/icmarkets.png",
    regulated: "ASIC / CySEC (varies by region)",
    minDeposit: "$200+",
    spreadFrom: "0.0 pips",
    platforms: "MT4 / MT5 / cTrader",
    short: "Raw spreads with strong liquidity.",
    demoUrl: "#",
    realUrl: "#",
  },
  {
    key: "vantage",
    name: "Vantage",
    logo: "/brokers/vantage.png",
    regulated: "ASIC / CIMA (varies by region)",
    minDeposit: "$50+",
    spreadFrom: "0.0–1.0 pips",
    platforms: "MT4 / MT5",
    short: "Competitive pricing and global presence.",
    demoUrl: "#",
    realUrl: "#",
  },
  {
    key: "fxtm",
    name: "FXTM",
    logo: "/brokers/fxtm.png",
    regulated: "FCA / CySEC (varies by region)",
    minDeposit: "$10+",
    spreadFrom: "1.0 pips",
    platforms: "MT4 / MT5",
    short: "Established broker with flexible options.",
    demoUrl: "#",
    realUrl: "#",
  },
];

export default function BrokersPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-7xl mx-auto px-6 py-16">
        {/* HERO */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Compare Trusted Forex Brokers
          </h1>
          <p className="text-zinc-400 mt-4">
            Open a demo or real account with a broker that matches your style.
            Compare regulation, spreads, platforms and key features.
          </p>
        </div>

        {/* ✅ DESKTOP TABLE ONLY (md+) */}
        <div className="mt-12 hidden md:block overflow-hidden rounded-2xl border border-zinc-800">
          <div className="bg-zinc-950/60 px-5 py-4 border-b border-zinc-800">
            <div className="text-sm font-semibold">Quick comparison</div>
            <div className="text-xs text-zinc-500 mt-1">
              Values may vary by region and account type.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/40 text-zinc-300">
                <tr className="[&>th]:text-left [&>th]:px-4 [&>th]:py-3">
                  <th>Broker</th>
                  <th>Regulation</th>
                  <th>Min deposit</th>
                  <th>Spread from</th>
                  <th>Platforms</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">
                {BROKERS.map((b) => (
                  <tr key={b.key} className="[&>td]:px-4 [&>td]:py-4">
                    <td className="font-semibold">
                      <div className="flex items-center gap-4">
                        {/* ✅ Logo fills box (less gaps) */}
                        <div className="relative h-12 w-32 rounded-2xl border border-zinc-800 bg-white/95 overflow-hidden">
                          <Image
                            src={b.logo}
                            alt={b.name}
                            fill
                            sizes="176px"
                            className="object-cover"
                            priority={b.key === "exness"}
                          />
                        </div>

                        <span className="text-base font-extrabold">{b.name}</span>
                      </div>
                    </td>

                    <td className="text-zinc-400">{b.regulated}</td>
                    <td className="text-zinc-200">{b.minDeposit}</td>
                    <td className="text-zinc-200">{b.spreadFrom}</td>
                    <td className="text-zinc-200">{b.platforms}</td>

                    <td className="text-right whitespace-nowrap">
                      <a
                        href={b.demoUrl}
                        className="inline-flex items-center rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold hover:bg-zinc-900 transition"
                      >
                        Demo
                      </a>
                      <a
                        href={b.realUrl}
                        className="inline-flex items-center rounded-lg bg-yellow-500 text-black px-3 py-2 text-xs font-semibold hover:bg-yellow-400 transition ml-2"
                      >
                        Real
                      </a>
                      <Link
                        href={`/brokers/${b.key}`}
                        className="inline-flex items-center rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-300 hover:bg-yellow-500/15 transition ml-2"
                      >
                        More info →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ MOBILE CARDS ONLY (<md) */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 md:hidden">
          {BROKERS.map((b) => (
            <div
              key={b.key}
              className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950/60 to-black p-6 hover:border-yellow-500/40 transition"
            >
              {/* ✅ Logo fills */}
              <div className="relative h-16 w-full rounded-2xl border border-zinc-800 bg-white/95 overflow-hidden">
                <Image
                  src={b.logo}
                  alt={b.name}
                  fill
                  sizes="600px"
                  className="object-cover"
                />
              </div>

              <div className="mt-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-extrabold">{b.name}</div>
                    <div className="text-xs text-zinc-500 mt-1">{b.regulated}</div>
                  </div>
                  <Link
                    href={`/brokers/${b.key}`}
                    className="shrink-0 inline-flex items-center rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-300 hover:bg-yellow-500/15 transition"
                  >
                    More info →
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                    <div className="text-xs text-zinc-500">Min deposit</div>
                    <div className="font-semibold text-zinc-100 mt-1">{b.minDeposit}</div>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                    <div className="text-xs text-zinc-500">Spread from</div>
                    <div className="font-semibold text-zinc-100 mt-1">{b.spreadFrom}</div>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-3 col-span-2">
                    <div className="text-xs text-zinc-500">Platforms</div>
                    <div className="font-semibold text-zinc-100 mt-1">{b.platforms}</div>
                  </div>
                </div>

                <p className="text-sm text-zinc-400 mt-4">{b.short}</p>

                <div className="mt-5 flex items-center gap-2">
                  <a
                    href={b.demoUrl}
                    className="flex-1 text-center rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold hover:bg-zinc-900 transition"
                  >
                    Demo
                  </a>
                  <a
                    href={b.realUrl}
                    className="flex-1 text-center rounded-lg bg-yellow-500 text-black px-4 py-2 text-sm font-semibold hover:bg-yellow-400 transition"
                  >
                    Real
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ NEW: Open account steps (SEO + conversion) */}
        <div className="mt-14 max-w-7xl mx-auto text-zinc-300 leading-relaxed">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            How to open a real forex trading account
          </h2>
          <p className="mt-4 text-zinc-400">
            If your goal is to start trading seriously, opening a real account is a straightforward process.
            Most regulated forex brokers follow the same steps below, with small differences based on your country and chosen account type.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
              <div className="text-sm font-semibold text-zinc-200">Step-by-step</div>

              <ol className="mt-4 space-y-3 text-zinc-400">
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-black text-xs font-extrabold">
                    1
                  </span>
                  <div>
                    <span className="text-zinc-200 font-semibold">Choose your broker</span>
                    <div className="text-sm mt-1">
                      Pick a regulated broker that supports your preferred platform (MT4/MT5/cTrader) and matches your trading style.
                    </div>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-black text-xs font-extrabold">
                    2
                  </span>
                  <div>
                    <span className="text-zinc-200 font-semibold">Create an account</span>
                    <div className="text-sm mt-1">
                      Fill in your details, set a password, and confirm your email/phone if required.
                    </div>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-black text-xs font-extrabold">
                    3
                  </span>
                  <div>
                    <span className="text-zinc-200 font-semibold">Verify your identity (KYC)</span>
                    <div className="text-sm mt-1">
                      Upload ID and proof of address. Verification can take minutes to 1–2 days depending on the broker.
                    </div>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-black text-xs font-extrabold">
                    4
                  </span>
                  <div>
                    <span className="text-zinc-200 font-semibold">Deposit funds</span>
                    <div className="text-sm mt-1">
                      Choose a payment method (card, bank, e-wallet) and fund your account. Start with an amount you can manage safely.
                    </div>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-black text-xs font-extrabold">
                    5
                  </span>
                  <div>
                    <span className="text-zinc-200 font-semibold">Start trading</span>
                    <div className="text-sm mt-1">
                      Install the platform, log in, and begin with small risk. Consider trying a demo first if you’re new.
                    </div>
                  </div>
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
              <div className="text-sm font-semibold text-zinc-200">Important tips</div>

              <ul className="mt-4 space-y-3 text-sm text-zinc-400">
                <li className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                  <span className="text-zinc-200 font-semibold">Use a demo account first:</span>{" "}
                  Test spreads, execution, and platform speed before depositing real money.
                </li>
                <li className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                  <span className="text-zinc-200 font-semibold">Check fees & withdrawals:</span>{" "}
                  A good broker should offer transparent withdrawal rules and reasonable processing times.
                </li>
                <li className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                  <span className="text-zinc-200 font-semibold">Match account type to strategy:</span>{" "}
                  Some strategies work better with raw spread + commission accounts.
                </li>
                <li className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                  <span className="text-zinc-200 font-semibold">Read each broker details:</span>{" "}
                  Use “More info” to see account types, key features, and direct links.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Existing SEO text (kept, but now supports the new section) */}
        <div className="mt-12 max-w-7xl mx-auto text-zinc-300 leading-relaxed">
          <h2 className="text-2xl font-extrabold text-white">
            How to choose a forex broker
          </h2>
          <p className="mt-4 text-zinc-400">
            When comparing brokers, focus on regulation, trading costs (spreads and commissions),
            platform support (MT4/MT5/cTrader), execution quality, and withdrawal speed.
            A regulated broker can provide better client protections depending on your region.
            Start with a demo account to test the platform and order execution before opening a real account.
          </p>
          <p className="mt-4 text-zinc-400">
            Use the “More info” button to read detailed broker pages with key features,
            account types, and direct links to open demo or real accounts.
          </p>
        </div>
      </section>
    </main>
  );
}