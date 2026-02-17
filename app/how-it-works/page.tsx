import Link from "next/link";

const steps = [
  {
    n: "1",
    title: "Choose a tournament",
    desc: "Go to the Schedule, pick an event, and open the tournament page.",
  },
  {
    n: "2",
    title: "Join + accept rules",
    desc: "Press Join, read the rules, and accept Terms & Privacy to continue.",
  },
  {
    n: "3",
    title: "Download the trading platform",
    desc: "Download the required platform for that tournament (example: MT4/MT5).",
  },
  {
    n: "4",
    title: "Submit your info",
    desc: "Enter your Name, Email, Phone, and your trading account details to appear on the leaderboard.",
  },
];

const faqs = [
  {
    q: "Do I need an account to join?",
    a: "Yes. If you are not signed in, you will be redirected to Sign in, then continue the join steps.",
  },
  {
    q: "Is entry free?",
    a: "Yes for now. Later we can enable paid entry per tournament without changing the design.",
  },
  {
    q: "How does the leaderboard work?",
    a: "Each tournament has a clear ranking rule (PnL / drawdown / consistency). You’ll see it inside the tournament rules.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <Link href="/" className="text-yellow-400 hover:underline text-sm">
          ← Back to Home
        </Link>

        <h1 className="mt-6 text-4xl md:text-5xl font-extrabold leading-[1.1]">
          How it works
        </h1>
        <p className="mt-3 text-zinc-400 max-w-2xl">
          Simple steps to join a tournament and show up on the leaderboard.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/schedule"
            className="bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold"
          >
            View schedule
          </Link>
          <Link
            href="/brokers"
            className="border border-zinc-700 px-5 py-3 rounded-lg hover:bg-zinc-900"
          >
            Brokers
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-6xl mx-auto px-6 pb-14">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-8">
          <h2 className="text-2xl font-bold">4 clear steps</h2>
          <p className="text-zinc-400 mt-2">
            Follow this flow every time you join a tournament.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-zinc-800 bg-black/30 p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-yellow-500 text-black font-bold flex items-center justify-center">
                    {s.n}
                  </div>
                  <div className="text-lg font-bold">{s.title}</div>
                </div>
                <div className="mt-3 text-sm text-zinc-400 leading-relaxed">
                  {s.desc}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black/30 p-6">
            <div className="font-semibold">What we collect (basic)</div>
            <div className="mt-2 text-sm text-zinc-400">
              Name • Email • Phone — plus your trading account details for tracking the tournament results.
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-8">
          <h2 className="text-2xl font-bold">FAQ</h2>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl border border-zinc-800 bg-black/30 p-6"
              >
                <div className="font-semibold">{f.q}</div>
                <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  {f.a}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/schedule"
              className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold"
            >
              Go to Schedule
            </Link>
            <Link
              href="/"
              className="border border-zinc-700 px-6 py-3 rounded-lg hover:bg-zinc-900"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
