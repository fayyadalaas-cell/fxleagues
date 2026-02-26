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
    bestFor: "General trading and beginners who want simplicity",
  },
  {
    name: "Raw Spread / ECN-style",
    spread: "Tighter spreads (often lower, account dependent)",
    commission: "Typically applies (account dependent)",
    bestFor: "Scalpers and active traders who care about total cost",
  },
  {
    name: "cTrader (Raw-style options)",
    spread: "Competitive spreads (platform/account dependent)",
    commission: "Often applies (account dependent)",
    bestFor: "Traders who prefer cTrader execution and interface",
  },
];

const FAQ: FAQItem[] = [
  {
    q: "Is the IC Markets demo account free?",
    a: "Yes—demo accounts are typically free. It’s the best way to test spreads, execution quality, and platform stability before using real funds.",
  },
  {
    q: "What is IC Markets best known for?",
    a: "IC Markets is commonly associated with cost-focused trading and execution. Many traders compare it mainly on total cost (spreads + commission) and platform options like MT4/MT5/cTrader.",
  },
  {
    q: "Does IC Markets support MT4, MT5, and cTrader?",
    a: "In many regions, IC Markets offers MT4, MT5, and cTrader. Exact availability may vary depending on the entity and your location.",
  },
  {
    q: "Is IC Markets regulated?",
    a: "IC Markets operates under different regulated entities depending on region. Always confirm the exact entity and license information shown during signup.",
  },
  {
    q: "What’s the difference between Standard and Raw accounts?",
    a: "Standard accounts are usually spread-only pricing (simpler). Raw accounts typically offer tighter spreads but charge a commission—often better for frequent trading if your strategy is cost-sensitive.",
  },
  {
    q: "What affects spreads and execution?",
    a: "Spreads depend on instrument, market volatility, session time, and account type. Execution can differ during news events, low-liquidity hours, or fast markets—demo testing helps validate real conditions.",
  },
  {
    q: "How do deposits and withdrawals work?",
    a: "Funding options and withdrawal times vary by payment method and region. The safest approach is to deposit a small amount and test a small withdrawal early.",
  },
  {
    q: "Can I use EAs (robots) with IC Markets?",
    a: "Usually yes on MT4/MT5. If you use automation, test on demo to confirm symbol settings, execution behavior, and permissions before going live.",
  },
];

export default function ICMarketsPage() {
  // ✅ ضع روابطك هنا لاحقاً (أو نخليها /go/icmarkets/demo)
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
                  src="/brokers/icmarkets.png"
                  alt="IC Markets"
                  width={180}
                  height={60}
                  className="object-contain max-h-10 w-auto"
                />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  IC Markets
                </h1>
                <p className="text-zinc-400 mt-1">
                  Raw spreads, strong execution, and platform flexibility for cost-focused trading.
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
                ASIC / CySEC (varies by region)
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Min Deposit</div>
              <div className="text-sm font-semibold mt-1">$200+ (common benchmark)</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Spread From</div>
              <div className="text-sm font-semibold mt-1">
                From 0.0 pips (account-type)
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Platforms</div>
              <div className="text-sm font-semibold mt-1">MT4 / MT5 / cTrader</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Best for</div>
              <div className="text-sm font-semibold mt-1">Scalping & active traders</div>
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
                IC Markets is widely compared on one main factor: total trading cost.
                Traders who place many trades typically evaluate spreads + commission
                and test execution during high-volatility sessions. Like most global brokers,
                conditions vary by region and entity, so the smartest approach is to start with
                a demo account and validate platform behavior before funding a real account.
              </p>

              <h3 className="text-lg font-bold mt-8">Trading conditions and costs</h3>
              <div className="mt-3 space-y-3 text-zinc-400 leading-relaxed">
                <p>
                  If you trade frequently, “Raw spread” style accounts can be attractive because
                  spreads may be tighter, but commission often applies. For many strategies,
                  this can be cheaper than spread-only pricing—but only if your trading frequency
                  is high enough to benefit from tighter spreads.
                </p>
                <p>
                  Execution quality is critical for scalping and short-term systems. Always test
                  on demo first, then track your real costs and slippage with small positions before scaling.
                </p>
                <p className="text-xs text-zinc-500">
                  Note: exact pricing and conditions depend on the entity, account type, and instrument.
                </p>
              </div>

              <h3 className="text-lg font-bold mt-8">Platforms and tools</h3>
              <ul className="mt-3 space-y-2 text-zinc-300">
                <li>• MT4 & MT5: widely used, compatible with many tools and EAs</li>
                <li>• cTrader: preferred by some traders for interface and execution style</li>
                <li>• If you use EAs, confirm symbol naming and permissions on demo first</li>
              </ul>

              <h3 className="text-lg font-bold mt-8">Deposits and withdrawals</h3>
              <div className="mt-3 space-y-3 text-zinc-400 leading-relaxed">
                <p>
                  Funding methods and withdrawal speed depend on your country and payment provider.
                  A safe practice is to test a small deposit and small withdrawal early, so you know
                  exactly what to expect before you trade with larger balances.
                </p>
                <p>
                  Keep your verification (KYC) ready—withdrawal flows often require full verification.
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
                Availability and exact pricing depend on region/entity. Use this table as a practical guide.
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
                Tip: If your strategy is cost-sensitive, compare weekly “total cost” (spread + commission + swaps).
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
                <li>✅ Cost-focused trading conditions (account dependent)</li>
                <li>✅ Multiple platform options (MT4/MT5/cTrader)</li>
                <li>✅ Popular for scalping and active trading styles</li>
                <li>✅ Demo-first testing is straightforward</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950/60 to-black p-7">
              <h3 className="text-lg font-extrabold">Cons</h3>
              <ul className="mt-4 space-y-2 text-zinc-300">
                <li>⚠️ Conditions vary by region/entity</li>
                <li>⚠️ Raw accounts often include commission</li>
                <li>⚠️ Spreads and execution can change during volatility</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-7">
              <div className="text-sm text-zinc-300">Ready to open an account?</div>
              <div className="text-2xl font-extrabold mt-1">
                Open your IC Markets account in minutes
              </div>
              <div className="text-sm text-zinc-400 mt-2">
                Start with demo to test costs and execution, then switch to real when ready.
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
              Test with demo, then open a real account
            </div>
            <div className="text-sm text-zinc-400 mt-2">
              Demo testing helps you validate spreads, commission impact, and execution behavior before funding.
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