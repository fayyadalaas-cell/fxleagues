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

        {/* COMPARISON TABLE */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-zinc-800">
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
    {/* Bigger logo box (match cards feel) */}
    <div className="relative h-16 w-44 rounded-2xl border border-zinc-800 bg-black/35 overflow-hidden flex items-center justify-center">
      <Image
        src={b.logo}
        alt={b.name}
        fill
        sizes="176px"
        className="object-contain p-2"
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

        {/* CARDS */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BROKERS.map((b) => (
            <div
              key={b.key}
              className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950/60 to-black p-6 hover:border-yellow-500/40 transition"
            >
              <div className="flex items-center justify-center h-16">
                <Image
                  src={b.logo}
                  alt={b.name}
                  width={160}
                  height={60}
                  className="object-contain max-h-12"
                />
              </div>

              <div className="mt-5 text-center">
                <div className="text-lg font-extrabold">{b.name}</div>
                <div className="text-xs text-zinc-500 mt-1">{b.regulated}</div>

                <p className="text-sm text-zinc-400 mt-3 min-h-[40px]">
                  {b.short}
                </p>

                <div className="mt-5 flex items-center justify-center gap-2">
                  <a
                    href={b.demoUrl}
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold hover:bg-zinc-900 transition"
                  >
                    Demo
                  </a>
                  <a
                    href={b.realUrl}
                    className="rounded-lg bg-yellow-500 text-black px-4 py-2 text-sm font-semibold hover:bg-yellow-400 transition"
                  >
                    Real
                  </a>
                </div>

                <div className="mt-4">
                  <Link
                    href={`/brokers/${b.key}`}
                    className="text-sm text-yellow-400 hover:underline"
                  >
                    More info →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SEO TEXT (short but useful) */}
        <div className="mt-14 max-w-4xl mx-auto text-zinc-300 leading-relaxed">
          <h2 className="text-2xl font-extrabold text-white">
            How to choose a forex broker
          </h2>
          <p className="mt-4 text-zinc-400">
            When comparing brokers, focus on regulation, trading costs (spreads
            and commissions), platform support (MT4/MT5/cTrader), execution
            quality, and withdrawal speed. A regulated broker can provide better
            client protections depending on your region. Start with a demo
            account to test the platform and order execution before opening a
            real account.
          </p>
          <p className="mt-4 text-zinc-400">
            Use the “More info” button to read detailed broker pages with key
            features, account types, and direct links to open demo or real
            accounts.
          </p>
        </div>
      </section>
    </main>
  );
}