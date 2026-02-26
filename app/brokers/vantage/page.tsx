import Link from "next/link";
import Image from "next/image";

type AccountTypeRow = {
  name: string;
  spread: string;
  commission: string;
  bestFor: string;
};

type FAQItem = { q: string; a: string };

const ACCOUNT_TYPES: AccountTypeRow[] = [
  {
    name: "Standard (Simple pricing)",
    spread: "Spread-based pricing (varies by instrument)",
    commission: "Usually none (depends on entity)",
    bestFor: "Beginners and general trading",
  },
  {
    name: "RAW / ECN-style",
    spread: "Tighter spreads (account dependent)",
    commission: "Typically applies (account dependent)",
    bestFor: "Active traders and scalpers focused on total cost",
  },
  {
    name: "Pro-style (platform dependent)",
    spread: "Competitive spreads (varies)",
    commission: "May apply (depends on account)",
    bestFor: "Traders who want flexibility and speed",
  },
];

const FAQ: FAQItem[] = [
  {
    q: "Is the Vantage demo account free?",
    a: "Yes—demo accounts are typically free. It’s a great way to test the platform, spreads, and execution before using real funds.",
  },
  {
    q: "What is Vantage best known for?",
    a: "Vantage is often compared for its platform accessibility, competitive pricing (account dependent), and broad global presence depending on region.",
  },
  {
    q: "Does Vantage support MT4 and MT5?",
    a: "In many regions, Vantage offers MT4 and MT5 (desktop and mobile). Platform availability can vary depending on entity and location.",
  },
  {
    q: "Is Vantage regulated?",
    a: "Vantage operates under different entities and regulation can vary by region. Always confirm the exact entity and license details shown during signup.",
  },
  {
    q: "How should I choose between Standard and RAW accounts?",
    a: "Standard is simpler (often spread-only). RAW accounts often have tighter spreads but add commission—usually better for high-frequency strategies if total cost ends up lower.",
  },
  {
    q: "What affects spreads and trading costs?",
    a: "Spreads change by instrument, volatility, session time, and account type. Your real total cost can include commission and overnight fees.",
  },
  {
    q: "How do deposits and withdrawals work?",
    a: "Methods and timing depend on your country and payment provider. Test a small deposit and small withdrawal early to confirm the flow.",
  },
  {
    q: "Can I use EAs (robots) with Vantage?",
    a: "Usually yes on MT4/MT5. Always test your EA on demo first to confirm symbol settings, execution behavior, and permissions.",
  },
];

export default function VantagePage() {
  // ✅ ضع روابطك هنا لاحقاً (أو نخليها /go/vantage/demo)
  const demoUrl = "#";
  const realUrl = "#";

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-7xl mx-auto px-6 py-12">
        <Link href="/brokers" className="text-yellow-400 hover:underline">
          ← Back to Brokers
        </Link>

        {/* HERO */}
        <div className="mt-6 rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950/70 to-black p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_90px_rgba(0,0,0,0.85)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-28 rounded-2xl border border-zinc-800 bg-zinc-950/60 flex items-center justify-center px-3">
                <Image
                  src="/brokers/vantage.png"
                  alt="Vantage"
                  width={180}
                  height={60}
                  className="object-contain max-h-10 w-auto"
                />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Vantage
                </h1>
                <p className="text-zinc-400 mt-1">
                  Competitive trading options, broad platform access, and global availability (region dependent).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={demoUrl}
                className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-900 transition"
              >
                Open Demo Account
              </a>
              <a
                href={realUrl}
                className="rounded-xl bg-yellow-500 text-black px-5 py-3 font-bold hover:bg-yellow-400 transition"
              >
                Open Real Account →
              </a>
            </div>
          </div>

          {/* QUICK FACTS */}
          <div className="mt-7 grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Regulation</div>
              <div className="text-sm font-semibold mt-1">
                ASIC / CIMA (varies by region)
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Min Deposit</div>
              <div className="text-sm font-semibold mt-1">$50+ (common benchmark)</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Spread From</div>
              <div className="text-sm font-semibold mt-1">
                From 0.0–1.0 pips (account-type)
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Platforms</div>
              <div className="text-sm font-semibold mt-1">MT4 / MT5</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Best for</div>
              <div className="text-sm font-semibold mt-1">Balanced trading styles</div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-6">
            {/* OVERVIEW */}
            <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950/60 to-black p-7">
              <h2 className="text-xl font-extrabold tracking-tight">Overview</h2>

              <p className="mt-4 text-zinc-400 leading-relaxed">
                Vantage is often evaluated by traders looking for a balance between platform accessibility
                and competitive trading conditions (account dependent). Like most global brokers, the exact
                pricing, leverage, and product availability can vary based on your region and the entity you
                register under. The most practical way to evaluate Vantage is to start with a demo account,
                test execution and spreads during different sessions, then switch to a real account once
                you’re comfortable with the total trading cost and platform stability.
              </p>

              <h3 className="text-lg font-bold mt-8">Trading conditions and costs</h3>
              <div className="mt-3 space-y-3 text-zinc-400 leading-relaxed">
                <p>
                  Your total trading cost is the combination of spreads + commission (if applicable) +
                  swaps/overnight fees. Some account types aim for simpler pricing, while RAW-style
                  accounts can provide tighter spreads but usually add a commission.
                </p>
                <p>
                  If your strategy depends on fast execution (scalping or short-term trading), test during
                  volatile sessions and compare results with your alternative broker options before scaling.
                </p>
                <p className="text-xs text-zinc-500">
                  Note: conditions vary by region/entity and instrument. Always confirm terms during signup.
                </p>
              </div>

              <h3 className="text-lg font-bold mt-8">Platforms and tools</h3>
              <ul className="mt-3 space-y-2 text-zinc-300">
                <li>• MT4 & MT5 support (desktop + mobile in many regions)</li>
                <li>• Practical for both manual traders and EA users</li>
                <li>• Demo-first testing is recommended for spread/execution validation</li>
              </ul>

              <h3 className="text-lg font-bold mt-8">Deposits and withdrawals</h3>
              <div className="mt-3 space-y-3 text-zinc-400 leading-relaxed">
                <p>
                  Funding methods differ by region (cards, bank transfer, e-wallets). A safe approach is to
                  deposit a small amount first and test a small withdrawal so you know the processing flow.
                </p>
                <p>
                  Keep verification (KYC) ready early—withdrawals commonly require full verification.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={demoUrl}
                  className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-900 transition"
                >
                  Start with Demo
                </a>
                <a
                  href={realUrl}
                  className="rounded-xl bg-yellow-500 text-black px-5 py-3 font-bold hover:bg-yellow-400 transition"
                >
                  Open Real Account →
                </a>
              </div>
            </div>

            {/* ACCOUNT TYPES */}
            <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950/60 to-black p-7">
              <h2 className="text-xl font-extrabold tracking-tight">Account types</h2>
              <p className="mt-3 text-zinc-400">
                Availability and pricing depend on region/entity. Use this as a comparison framework.
              </p>

              <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-black/40 text-zinc-300">
                      <tr className="[&>th]:text-left [&>th]:px-4 [&>th]:py-3">
                        <th>Type</th>
                        <th>Spreads</th>
                        <th>Commission</th>
                        <th>Best for</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {ACCOUNT_TYPES.map((r) => (
                        <tr key={r.name} className="[&>td]:px-4 [&>td]:py-4">
                          <td className="font-semibold">{r.name}</td>
                          <td className="text-zinc-300">{r.spread}</td>
                          <td className="text-zinc-300">{r.commission}</td>
                          <td className="text-zinc-300">{r.bestFor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-5 text-xs text-zinc-500">
                Tip: Track your “all-in cost” over a week (spread + commission + swaps) before deciding.
              </div>
            </div>

            {/* FAQ */}
            <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950/60 to-black p-7">
              <h2 className="text-xl font-extrabold tracking-tight">FAQ</h2>
              <div className="mt-5 space-y-4">
                {FAQ.map((f) => (
                  <div
                    key={f.q}
                    className="rounded-2xl border border-zinc-800 bg-black/30 p-5"
                  >
                    <div className="font-bold">{f.q}</div>
                    <div className="text-zinc-400 mt-2 leading-relaxed">{f.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950/60 to-black p-7">
              <h3 className="text-lg font-extrabold">Pros</h3>
              <ul className="mt-4 space-y-2 text-zinc-300">
                <li>✅ Competitive pricing options (account dependent)</li>
                <li>✅ MT4/MT5 platform support</li>
                <li>✅ Works for multiple trading styles</li>
                <li>✅ Easy demo-first evaluation</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950/60 to-black p-7">
              <h3 className="text-lg font-extrabold">Cons</h3>
              <ul className="mt-4 space-y-2 text-zinc-300">
                <li>⚠️ Conditions vary by region/entity</li>
                <li>⚠️ RAW-style accounts often add commission</li>
                <li>⚠️ Spreads can widen during volatility</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-7">
              <div className="text-sm text-zinc-300">Ready to open an account?</div>
              <div className="text-2xl font-extrabold mt-1">
                Open your Vantage account in minutes
              </div>
              <div className="text-sm text-zinc-400 mt-2">
                Start with demo to test execution and costs, then switch to real when ready.
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={demoUrl}
                  className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-900 transition"
                >
                  Demo
                </a>
                <a
                  href={realUrl}
                  className="rounded-xl bg-yellow-500 text-black px-6 py-3 font-bold hover:bg-yellow-400 transition"
                >
                  Real Account →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FOOT CTA */}
        <div className="mt-10 rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950/60 to-black p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="text-sm text-zinc-400">Next step</div>
            <div className="text-2xl font-extrabold mt-1">
              Start with demo, then open a real account
            </div>
            <div className="text-sm text-zinc-400 mt-2">
              Demo testing helps you confirm spreads, commission impact, and platform comfort before funding.
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={demoUrl}
              className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-900 transition"
            >
              Open Demo
            </a>
            <a
              href={realUrl}
              className="rounded-xl bg-yellow-500 text-black px-6 py-3 font-bold hover:bg-yellow-400 transition"
            >
              Open Real →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}