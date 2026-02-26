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
    spread: "Typical spread-based pricing",
    commission: "Usually none (depends on entity)",
    bestFor: "Beginners and simple trading",
  },
  {
    name: "Low-spread / Pro-style",
    spread: "Lower spreads (varies by instrument)",
    commission: "May apply (depends on account)",
    bestFor: "Active traders focused on total cost",
  },
  {
    name: "Raw / Zero-style",
    spread: "Tight spreads (often lower)",
    commission: "More likely (depends on account)",
    bestFor: "Scalping and high-frequency strategies",
  },
];

const FAQ: FAQItem[] = [
  {
    q: "Is the Exness demo account free?",
    a: "Yes—demo accounts are typically free and are the best way to test execution, platform stability, and spreads before trading with real funds.",
  },
  {
    q: "How do I choose between demo and real account?",
    a: "Start with demo to learn the platform and test costs. Move to real only after you understand spreads/fees and you’ve tested deposits + a small withdrawal.",
  },
  {
    q: "Does Exness support MT4 and MT5?",
    a: "In most regions, Exness supports MT4 and MT5. Platform availability can vary by entity—confirm what’s offered during signup.",
  },
  {
    q: "Is Exness regulated?",
    a: "Exness operates under different regulated entities depending on your region. Always confirm the exact entity and license shown during registration.",
  },
  {
    q: "What affects spreads and trading costs?",
    a: "Spreads vary by instrument, market volatility, session time, and account type. Your real total cost also includes commission (if any) and overnight fees.",
  },
  {
    q: "How long do deposits and withdrawals take?",
    a: "Timing depends on your payment method and region. The safest approach is to test with a small amount first and verify the withdrawal flow early.",
  },
  {
    q: "Which account type should I choose?",
    a: "If you’re new, start with a simple spread-based account. If you trade frequently, compare a low-spread/pro or raw-style account and measure total cost in practice.",
  },
  {
    q: "Can I use an EA (robot) with Exness?",
    a: "Usually yes on MT4/MT5. Test your EA on a demo first to confirm symbol settings, permissions, and execution behavior.",
  },
];

export default function ExnessPage() {
  // ✅ ضع روابطك هنا لاحقاً (أو نخليها /go/exness/demo)
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
                  src="/brokers/exness.png"
                  alt="Exness"
                  width={180}
                  height={60}
                  className="object-contain max-h-10 w-auto"
                />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Exness
                </h1>
                <p className="text-zinc-400 mt-1">
                  Fast execution, flexible account types, and strong global presence.
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
              <div className="text-sm font-semibold mt-1">$10+ (varies)</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Spread From</div>
              <div className="text-sm font-semibold mt-1">
                From 0.0 pips (account-type)
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Platforms</div>
              <div className="text-sm font-semibold mt-1">MT4 / MT5 / Web / Mobile</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Best for</div>
              <div className="text-sm font-semibold mt-1">Beginners & active traders</div>
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
                Exness is a well-known global broker that attracts traders who want
                a smooth onboarding experience, flexible account options, and strong
                platform support. Trading conditions (such as spreads, commissions,
                leverage, and available instruments) can differ depending on your
                country and the entity you register with. A practical way to evaluate
                any broker is to start with a demo account, test the platform during
                different market sessions, then move to a real account once you’re
                comfortable with the experience and total costs.
              </p>

              <h3 className="text-lg font-bold mt-8">Trading conditions and costs</h3>
              <div className="mt-3 space-y-3 text-zinc-400 leading-relaxed">
                <p>
                  The true cost of trading is not just the spread. It’s spreads + commissions
                  (if applicable) + swaps/overnight fees. Some account types prioritize a
                  simple spread-only model, while others aim for tighter spreads with a commission.
                </p>
                <p>
                  Execution quality matters, especially during high volatility. A broker can look
                  cheap on paper but feel expensive if slippage is frequent. The best test is to
                  run demo first, then track real costs over a short period using small positions.
                </p>
                <p className="text-xs text-zinc-500">
                  Note: conditions vary by region, entity, and account type. Always confirm the
                  official terms shown during registration.
                </p>
              </div>

              <h3 className="text-lg font-bold mt-8">Platforms and tools</h3>
              <ul className="mt-3 space-y-2 text-zinc-300">
                <li>• MT4 and MT5 support (desktop + mobile in most regions)</li>
                <li>• Web access may be available depending on your region</li>
                <li>• If you use EAs, test symbol settings and permissions on demo first</li>
              </ul>

              <h3 className="text-lg font-bold mt-8">Deposits and withdrawals</h3>
              <div className="mt-3 space-y-3 text-zinc-400 leading-relaxed">
                <p>
                  Withdrawal experience is often the biggest decision factor. The safest approach:
                  fund a small amount, then withdraw a small amount to confirm processing time and
                  available methods in your region.
                </p>
                <p>
                  Payment methods differ by country (cards, bank transfer, e-wallets). Some options
                  may have limits or require additional verification.
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
                Account availability and exact pricing depend on region/entity. Use this table as a
                practical guide when comparing options.
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
                Tip: If you trade frequently, compare “total cost” over a week (spread + commission + swaps).
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
                <li>✅ Competitive spreads (account dependent)</li>
                <li>✅ MT4/MT5 support</li>
                <li>✅ Smooth account opening</li>
                <li>✅ Good for beginners to start with demo</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950/60 to-black p-7">
              <h3 className="text-lg font-extrabold">Cons</h3>
              <ul className="mt-4 space-y-2 text-zinc-300">
                <li>⚠️ Conditions vary by region/entity</li>
                <li>⚠️ Costs depend on account type and instrument</li>
                <li>⚠️ Withdrawals depend on payment method availability</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-7">
              <div className="text-sm text-zinc-300">Ready to open an account?</div>
              <div className="text-2xl font-extrabold mt-1">
                Open your Exness account in minutes
              </div>
              <div className="text-sm text-zinc-400 mt-2">
                Start with demo to test the platform, then switch to real when you’re ready.
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
              Start with a demo, then open a real account
            </div>
            <div className="text-sm text-zinc-400 mt-2">
              A quick demo test helps you confirm spreads, execution, and platform comfort before funding.
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