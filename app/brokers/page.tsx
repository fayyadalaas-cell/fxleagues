import Link from "next/link";
import Image from "next/image";

type Broker = {
  id: string;
  name: string;
  logo: string; // in /public/brokers
  regulatedLabel: string;
  short: string;
  highlights: string[];
  meta: {
    platforms: string;
    spreadFrom: string;
    minDeposit: string;
    payoutSpeed: string;
  };
  links: {
    real: string;
    demo: string;
    details: string;
  };
};

const brokers: Broker[] = [
  {
    id: "exness",
    name: "Exness",
    logo: "/brokers/exness.png",
    regulatedLabel: "Regulated",
    short: "Fast execution + popular in MENA traders",
    highlights: ["Fast withdrawals", "Solid spreads", "MT4/MT5 friendly"],
    meta: {
      platforms: "MT4 • MT5",
      spreadFrom: "From 0.0",
      minDeposit: "$10",
      payoutSpeed: "Fast",
    },
    links: {
      real: "#",
      demo: "#",
      details: "/brokers/exness",
    },
  },
  {
    id: "icmarkets",
    name: "IC Markets",
    logo: "/brokers/icmarkets.png",
    regulatedLabel: "Regulated",
    short: "Raw pricing + great for scalping",
    highlights: ["Raw spreads", "High liquidity", "cTrader option"],
    meta: {
      platforms: "MT4 • MT5 • cTrader",
      spreadFrom: "From 0.0",
      minDeposit: "$200",
      payoutSpeed: "Fast",
    },
    links: {
      real: "#",
      demo: "#",
      details: "/brokers/icmarkets",
    },
  },
  {
    id: "vantage",
    name: "Vantage",
    logo: "/brokers/vantage.png",
    regulatedLabel: "Regulated",
    short: "Smooth onboarding + competitive trading conditions",
    highlights: ["Good for beginners", "MT4/MT5", "Low friction signup"],
    meta: {
      platforms: "MT4 • MT5",
      spreadFrom: "Competitive",
      minDeposit: "$50",
      payoutSpeed: "Good",
    },
    links: {
      real: "#",
      demo: "#",
      details: "/brokers/vantage",
    },
  },
  {
    id: "fxtm",
    name: "FXTM",
    logo: "/brokers/fxtm.png",
    regulatedLabel: "Regulated",
    short: "Well-known brand + wide global reach",
    highlights: ["Strong brand", "Multiple account types", "Education-friendly"],
    meta: {
      platforms: "MT4 • MT5",
      spreadFrom: "From 1.0",
      minDeposit: "$10",
      payoutSpeed: "Varies",
    },
    links: {
      real: "#",
      demo: "#",
      details: "/brokers/fxtm",
    },
  },
];

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] px-2 py-1 rounded-full border border-zinc-800 bg-black/30 text-zinc-200">
      {children}
    </span>
  );
}

export default function BrokersPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-12">
        <Link href="/" className="text-yellow-400 hover:underline text-sm">
          ← Back to Lobby
        </Link>

        {/* Header */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.05]">
              Open a broker account{" "}
              <span className="text-yellow-400">— faster</span> tournament access
            </h1>

            <p className="text-zinc-400 mt-4 max-w-xl">
              Choose a trusted broker, open a <span className="text-white font-semibold">real</span> or{" "}
              <span className="text-white font-semibold">demo</span> account, then join upcoming FX Leagues tournaments.
              (Affiliate links later — same price for users.)
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/schedule"
                className="bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold"
              >
                View tournament schedule
              </Link>
              <a
                href="#directory"
                className="border border-zinc-700 px-5 py-3 rounded-lg hover:bg-zinc-900"
              >
                Compare brokers
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-zinc-300">
              <Pill>MT4</Pill>
              <Pill>MT5</Pill>
              <Pill>cTrader</Pill>
              <Pill>Low spreads</Pill>
              <Pill>Fast withdrawals</Pill>
            </div>
          </div>

          {/* Right info card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
              <div className="text-xs text-zinc-400">How it connects to tournaments</div>
              <div className="text-lg font-bold mt-1">3 simple steps</div>

              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-lg bg-yellow-500 text-black font-bold flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-white">Pick a broker</div>
                    <div className="text-zinc-400">Choose conditions that match your style.</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-lg bg-yellow-500 text-black font-bold flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-white">Open real or demo</div>
                    <div className="text-zinc-400">Get your trading account ready.</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-lg bg-yellow-500 text-black font-bold flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-white">Join a tournament</div>
                    <div className="text-zinc-400">Submit account info inside the Join steps.</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-zinc-800 bg-black/30 p-4">
                <div className="text-xs text-zinc-400">Phase</div>
                <div className="font-semibold mt-1">Demo / Free Entry</div>
                <div className="text-xs text-zinc-500 mt-1">
                  Real-money tournaments + broker integrations come next.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logo strip */}
        <div className="mt-10 rounded-2xl border border-zinc-900 bg-zinc-950/40 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Trusted brokers</div>
              <div className="text-xs text-zinc-500">Logos from /public/brokers</div>
            </div>

            <div className="flex flex-wrap gap-3">
              {brokers.map((b) => (
                <div
                  key={b.id}
                  className="h-10 w-[140px] rounded-xl border border-zinc-800 bg-black/30 flex items-center justify-center px-3"
                >
                  <Image
                    src={b.logo}
                    alt={b.name}
                    width={120}
                    height={28}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Directory */}
        <div id="directory" className="mt-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold">Broker directory</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Clear actions: open account → then go join a tournament.
              </p>
            </div>
            <Link href="/schedule" className="text-sm text-yellow-400 hover:underline">
              Go to Schedule →
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {brokers.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 hover:bg-zinc-900/30 transition"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl border border-zinc-800 bg-black/30 flex items-center justify-center overflow-hidden px-2">
                      <Image
                        src={b.logo}
                        alt={b.name}
                        width={44}
                        height={44}
                        className="object-contain"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold">{b.name}</div>
                        <span className="text-[11px] px-2 py-1 rounded-full border border-green-700/60 bg-green-500/10 text-green-300">
                          {b.regulatedLabel}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-400 mt-1">{b.short}</div>
                    </div>
                  </div>

                  <Link
                    href={b.links.details}
                    className="text-sm text-yellow-400 hover:underline whitespace-nowrap"
                  >
                    Details →
                  </Link>
                </div>

                {/* Meta grid */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-800 bg-black/25 p-4">
                    <div className="text-xs text-zinc-500">Platforms</div>
                    <div className="text-sm font-semibold mt-1">{b.meta.platforms}</div>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-black/25 p-4">
                    <div className="text-xs text-zinc-500">Spread</div>
                    <div className="text-sm font-semibold mt-1">{b.meta.spreadFrom}</div>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-black/25 p-4">
                    <div className="text-xs text-zinc-500">Min deposit</div>
                    <div className="text-sm font-semibold mt-1">{b.meta.minDeposit}</div>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-black/25 p-4">
                    <div className="text-xs text-zinc-500">Withdrawals</div>
                    <div className="text-sm font-semibold mt-1">{b.meta.payoutSpeed}</div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {b.highlights.map((h) => (
                    <Pill key={h}>{h}</Pill>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={b.links.real}
                    className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold"
                  >
                    Open real account
                  </a>
                  <a
                    href={b.links.demo}
                    className="border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-900 font-semibold"
                  >
                    Open demo
                  </a>

                  <Link
                    href="/schedule"
                    className="ml-auto border border-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-900 text-sm"
                  >
                    Then join a tournament →
                  </Link>
                </div>

                <div className="mt-3 text-xs text-zinc-500">
                  Tip: after creating an account, go to Schedule and press <span className="text-zinc-200 font-semibold">Join</span>.
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer spacer */}
        <div className="mt-14 border-t border-zinc-900/70 pt-8 text-sm text-zinc-500 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>© 2026 FX Leagues — Build in progress</div>
          <div className="flex gap-4">
            <a className="hover:text-zinc-300" href="#">Terms</a>
            <a className="hover:text-zinc-300" href="#">Privacy</a>
            <a className="hover:text-zinc-300" href="#">Contact</a>
          </div>
        </div>
      </section>
    </main>
  );
}
