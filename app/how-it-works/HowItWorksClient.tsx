import Link from "next/link";

const steps = [
  {
    n: "1",
    title: "Choose a tournament",
    desc: "Go to the Schedule, pick an event, and open the tournament page to review rules and ranking criteria.",
  },
  {
    n: "2",
    title: "Join + accept rules",
    desc: "Press Join, review the tournament rules, and accept Terms & Privacy to continue.",
  },
  {
    n: "3",
    title: "Trade on demo (tournament period)",
    desc: "Trade during the tournament window using the required platform (MT4/MT5, etc.) and follow the rules.",
  },
  {
    n: "4",
    title: "Results + review",
    desc: "Leaderboards may lock when the tournament ends. Final results are reviewed and announced within 48 hours.",
  },
];

const ruleBlocks = [
  {
    title: "Entry & eligibility",
    points: [
      "You must be signed in to join a tournament.",
      "Each tournament has its own ranking rule (PnL / drawdown / consistency).",
      "You are responsible for following the tournament requirements and time window.",
    ],
  },
  {
    title: "One account policy (strict)",
    points: [
      "Only one FX Leagues account is allowed per person.",
      "Multiple accounts (same person) are not allowed under any circumstances.",
      "Suspicious duplicate activity may lead to review, disqualification, or bans.",
    ],
  },
  {
    title: "Fair competition & anti-abuse",
    points: [
      "Any manipulation, collusion, or falsified information is prohibited.",
      "Exploiting bugs or attempting to bypass platform rules is not allowed.",
      "If suspicious activity is detected, results may be delayed for verification.",
    ],
  },
];

const enforcement = [
  {
    title: "Disqualification",
    desc: "Rule violations can result in immediate removal from the current tournament results.",
  },
  {
    title: "Temporary / permanent ban",
    desc: "Repeated violations or severe abuse may lead to restrictions from future tournaments.",
  },
  {
    title: "Removal from winners",
    desc: "If a winner is later found to violate rules, they may be removed from the Winners page.",
  },
];

const faqs = [
  {
    q: "Do I need an account to join?",
    a: "Yes. If you are not signed in, you will be redirected to Sign in, then you can continue the join steps.",
  },
  {
    q: "When are results announced?",
    a: "Final results are reviewed and announced within 48 hours after the tournament ends.",
  },
  {
    q: "Can I join with multiple accounts?",
    a: "No. One person = one account. Multiple accounts can lead to disqualification and bans.",
  },
  {
    q: "How does the leaderboard work?",
    a: "Each tournament defines the ranking method (PnL / drawdown / consistency). You’ll see the exact criteria inside the tournament rules.",
  },
  {
    q: "Is entry free?",
    a: "Yes for now. Later we can enable paid entry per tournament without changing the design.",
  },
  {
    q: "What happens if someone tries to manipulate results?",
    a: "They may be disqualified, removed from results, and restricted from future tournaments depending on severity.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
<section className="max-w-7xl mx-auto px-6 pt-10 pb-8">
  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 relative overflow-hidden">
    {/* subtle glow */}
    <div className="pointer-events-none absolute -top-12 left-0 right-0 h-12 bg-gradient-to-b from-yellow-500/10 to-transparent blur-2xl" />
    <div className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />

    <div className="p-7 md:p-8">
      <Link href="/" className="text-yellow-400 hover:underline text-sm">
        ← Back to Home
      </Link>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-[1.25fr_0.75fr] gap-6 items-start">
        {/* Left */}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.1]">
            How it works
          </h1>

          <p className="mt-3 text-zinc-400 max-w-3xl">
            Join trading tournaments with clear rules. Leaderboards may lock at the end, and final
            results are announced within{" "}
            <span className="text-yellow-400 font-semibold">48 hours</span>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/schedule"
              className="bg-yellow-500 text-black px-5 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition"
            >
              View schedule
            </Link>

            <Link
              href="/brokers"
              className="border border-zinc-700 px-5 py-3 rounded-lg hover:bg-zinc-900 transition"
            >
              Brokers
            </Link>

            <Link
              href="/terms"
              className="border border-zinc-700 px-5 py-3 rounded-lg hover:bg-zinc-900 transition"
            >
              Terms
            </Link>
          </div>
        </div>

        {/* Right */}
        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Results timeline</div>
              <div className="mt-1 text-xs text-zinc-400">
                Final results are reviewed & announced within
              </div>
            </div>

            <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/10 px-3 py-2">
              <div className="text-sm font-extrabold text-yellow-100">48h</div>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-zinc-300">
            <div className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
              <span>One account per person (strict).</span>
            </div>
            <div className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
              <span>No manipulation or abuse.</span>
            </div>
            <div className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
              <span>Tournaments have clear ranking rules.</span>
            </div>
          </div>

          <div className="mt-4 text-xs text-zinc-500">
            By joining, you agree to follow tournament rules and platform terms.
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* STEPS */}
      <section className="max-w-7xl mx-auto px-6 pb-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-8">
          <h2 className="text-2xl font-bold">4 clear steps</h2>
          <p className="text-zinc-400 mt-2">
            Follow this process whenever you join a tournament.
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
            <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Email + username — and tournament participation data required to track results and enforce fairness.
            </div>
          </div>
        </div>
      </section>

      {/* RULES */}
      <section className="max-w-7xl mx-auto px-6 pb-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-8">
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
            <div>
              <h2 className="text-2xl font-bold">Rules & enforcement</h2>
              <p className="mt-2 text-zinc-400 max-w-2xl">
                By joining any tournament, you agree to follow the rules. Violations can result in disqualification or bans.
              </p>
            </div>

            <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-3">
              <div className="text-sm font-semibold text-yellow-100">Results timeline</div>
              <div className="text-xs text-yellow-100/80 mt-1">
                Final results announced within <span className="font-semibold">48 hours</span>.
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {ruleBlocks.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl border border-zinc-800 bg-black/30 p-6"
              >
                <div className="text-lg font-bold">{r.title}</div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                  {r.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                      <span className="leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black/30 p-6">
            <div className="font-semibold">Important note</div>
            <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Multiple accounts, manipulation, or abuse can lead to immediate disqualification, removal from results, and restrictions from future tournaments.
            </div>
          </div>
        </div>
      </section>

      {/* ACTIONS */}
      <section className="max-w-7xl mx-auto px-6 pb-14">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-8">
          <h2 className="text-2xl font-bold">Actions we may take</h2>
          <p className="mt-2 text-zinc-400 max-w-2xl">
            We protect honest participants by enforcing rules consistently.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {enforcement.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-zinc-800 bg-black/30 p-6"
              >
                <div className="text-lg font-bold">{p.title}</div>
                <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  {p.desc}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/schedule"
              className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition"
            >
              View tournaments
            </Link>
            <Link
              href="/privacy"
              className="border border-zinc-700 px-6 py-3 rounded-lg hover:bg-zinc-900 transition"
            >
              Privacy policy
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
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
              className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition"
            >
              Go to Schedule
            </Link>
            <Link
              href="/"
              className="border border-zinc-700 px-6 py-3 rounded-lg hover:bg-zinc-900 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}