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
    name: "Advantage / Low-spread style",
    spread: "Lower spreads (account dependent)",
    commission: "May apply (account dependent)",
    bestFor: "Active traders focused on total cost",
  },
  {
    name: "Pro-style / ECN-like options",
    spread: "Competitive spreads (varies)",
    commission: "Often applies (depends on account)",
    bestFor: "Scalping and higher-frequency strategies",
  },
];

const FAQ: FAQItem[] = [
  {
    q: "Is the FXTM demo account free?",
    a: "Yes—demo accounts are typically free and are recommended to test platforms, spreads, and execution before trading with real funds.",
  },
  {
    q: "What is FXTM best known for?",
    a: "FXTM is often evaluated for its global reach (region dependent), platform availability, and structured account options that fit different trader levels.",
  },
  {
    q: "Does FXTM support MT4 and MT5?",
    a: "In many regions, FXTM supports MT4 and may support MT5 depending on the entity and your location. Confirm what’s available during signup.",
  },
  {
    q: "Is FXTM regulated?",
    a: "FXTM operates under different entities with regulation depending on region. Always confirm the exact entity and license shown during registration.",
  },
  {
    q: "How do I choose the best FXTM account type?",
    a: "If you want simplicity, start with a standard spread-based account. If you trade frequently, compare a low-spread/commission structure and evaluate total cost over time.",
  },
  {
    q: "What affects spreads and trading costs?",
    a: "Spreads change by instrument, session time, and volatility. Total cost can include commission and overnight fees depending on account type.",
  },
  {
    q: "How do deposits and withdrawals work?",
    a: "Payment methods and processing time vary by region and provider. The safest approach is to test with a small deposit and a small withdrawal early.",
  },
  {
    q: "Can I use EAs (robots) with FXTM?",
    a: "Usually yes on MT4/MT5 where available. Always test your EA on demo first to confirm permissions, symbol settings, and execution behavior.",
  },
];

export default function FXTMPage() {
  // ✅ ضع روابطك هنا لاحقاً (أو نخليها /go/fxtm/demo)
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
                  src="/brokers/fxtm.png"
                  alt="FXTM"
                  width={180}
                  height={60}
                  className="object-contain max-h-10 w-auto"
                />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  FXTM
                </h1>
                <p className="text-zinc-400 mt-1">
                  Structured account options, broad platform access, and global availability (region dependent).
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
                FCA / CySEC (varies by region)
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Min Deposit</div>
              <div className="text-sm font-semibold mt-1">$10–$200+ (varies)</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Spread From</div>
              <div className="text-sm font-semibold mt-1">
                Competitive (account-type dependent)
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Platforms</div>
              <div className="text-sm font-semibold mt-1">MT4 / (MT5 varies)</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Best for</div>
              <div className="text-sm font-semibold mt-1">Beginners & structured trading</div>
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
                FXTM is often chosen by traders who prefer clear account structures and a familiar
                trading environment. Like most global brokers, pricing, leverage, instruments, and
                platform availability can vary depending on your region and the entity you register with.
                The best way to evaluate FXTM is to open a demo account first, test the platform and costs,
                then move to a real account after you confirm the full deposit/withdrawal flow.
              </p>

              <h3 className="text-lg font-bold mt-8">Trading conditions and costs</h3>
              <div className="mt-3 space-y-3 text-zinc-400 leading-relaxed">
                <p>
                  The key comparison is total cost: spreads + commission (if applicable) + swaps/overnight fees.
                  Some account types aim for simplicity (spread-only), while others may offer lower spreads
                  with a commission—often more suitable for frequent trading.
                </p>
                <p>
                  Execution can vary during volatile sessions. Always test your strategy on demo first, then
                  validate real behavior using small positions before scaling.
                </p>
                <p className="text-xs text-zinc-500">
                  Note: exact costs and account availability depend on region/entity and instrument.
                </p>
              </div>

              <h3 className="text-lg font-bold mt-8">Platforms and tools</h3>
              <ul className="mt-3 space-y-2 text-zinc-300">
                <li>• MT4 is commonly available; MT5 availability can vary by region</li>
                <li>• Works for manual trading and (where supported) EA automation</li>
                <li>• Demo testing helps validate spreads and platform comfort</li>
              </ul>

              <h3 className="text-lg font-bold mt-8">Deposits and withdrawals</h3>
              <div className="mt-3 space-y-3 text-zinc-400 leading-relaxed">
                <p>
                  Funding methods differ by country (cards, bank transfer, e-wallets). The safest practice
                  is to deposit a small amount first and test a small withdrawal to confirm processing time
                  and any verification requirements.
                </p>
                <p>
                  Prepare KYC early—withdrawals often require full verification even if deposits were quick.
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
                Account availability and exact pricing depend on region/entity. Use this table as a comparison framework.
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
                Tip: Track your real “all-in cost” (spread + commission + swaps) over several sessions before deciding.
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
                <li>✅ Clear account structure (region dependent)</li>
                <li>✅ Familiar platform environment (MT4 widely used)</li>
                <li>✅ Suitable for beginners with demo-first flow</li>
                <li>✅ Multiple pricing styles (account dependent)</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950/60 to-black p-7">
              <h3 className="text-lg font-extrabold">Cons</h3>
              <ul className="mt-4 space-y-2 text-zinc-300">
                <li>⚠️ Conditions vary by region/entity</li>
                <li>⚠️ Some account types may include commission</li>
                <li>⚠️ Platform availability (MT5) can vary</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-7">
              <div className="text-sm text-zinc-300">Ready to open an account?</div>
              <div className="text-2xl font-extrabold mt-1">
                Open your FXTM account in minutes
              </div>
              <div className="text-sm text-zinc-400 mt-2">
                Start with demo, validate costs and withdrawals, then switch to a real account when ready.
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
              Demo testing helps you confirm platform comfort and trading costs before funding with larger amounts.
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