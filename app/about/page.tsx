export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* HERO */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            About Forex Leagues
          </h1>

          <p className="mt-2 text-sm sm:text-base text-white/60">
            Independent. Competition-driven. Performance-focused.
          </p>

          <p className="mt-4 text-base sm:text-lg text-white/70 max-w-3xl leading-relaxed">
            Forex Leagues is a competition-first platform for verified trading
            tournaments—built around performance, transparency, and fair play.
            We create structured competitions where serious traders can compete
            under clear rules and measurable outcomes.
          </p>

          {/* CTA - mobile stacked */}
          <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a
              href="/schedule"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-yellow-400 px-6 py-3 text-black font-semibold hover:opacity-90 transition"
            >
              View tournaments
            </a>

            <a
              href="/how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-white hover:bg-white/10 transition"
            >
              How it works
            </a>
          </div>
        </div>

        {/* MISSION + VISION */}
        <div className="mt-10 sm:mt-14 grid gap-5 sm:gap-8 md:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 hover:bg-white/[0.07] transition">
            <h2 className="text-lg sm:text-xl font-semibold">Mission</h2>
            <p className="mt-4 text-white/70 leading-relaxed">
              Make trading competitions structured, measurable, and trusted—so
              participants compete under clear rules, and every result is easy to
              understand and compare.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 hover:bg-white/[0.07] transition">
            <h2 className="text-lg sm:text-xl font-semibold">Vision</h2>
            <p className="mt-4 text-white/70 leading-relaxed">
              Build a global competition-first ecosystem for traders—where
              tournaments, rankings, and sponsor-backed opportunities create a
              transparent path for performance to stand out.
            </p>
          </section>
        </div>

        {/* WHY FOREX LEAGUES */}
        <div className="mt-12 sm:mt-16 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold">Why Forex Leagues?</h2>
          <p className="mt-3 text-white/70 max-w-3xl leading-relaxed">
            Built for serious competition—designed to reward skill, consistency,
            and measurable performance.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.07] transition">
              <div className="text-sm text-yellow-400 font-semibold">
                Structured competition
              </div>
              <div className="mt-2 text-white font-semibold">
                Clear rules & scoring
              </div>
              <p className="mt-2 text-white/70 leading-relaxed">
                Defined timelines, criteria, and expectations—so every tournament
                feels consistent and fair.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.07] transition">
              <div className="text-sm text-yellow-400 font-semibold">
                Transparent performance
              </div>
              <div className="mt-2 text-white font-semibold">
                Results that hold up
              </div>
              <p className="mt-2 text-white/70 leading-relaxed">
                We emphasize measurable outcomes and clarity—so leaderboards
                reflect real competition, not noise.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.07] transition">
              <div className="text-sm text-yellow-400 font-semibold">
                Integrity mindset
              </div>
              <div className="mt-2 text-white font-semibold">
                Fair-play approach
              </div>
              <p className="mt-2 text-white/70 leading-relaxed">
                Competitions are built with integrity in mind—focused on fairness,
                consistency, and trust.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.07] transition">
              <div className="text-sm text-yellow-400 font-semibold">
                Built like a platform
              </div>
              <div className="mt-2 text-white font-semibold">
                Scalable by design
              </div>
              <p className="mt-2 text-white/70 leading-relaxed">
                Starting demo-first enables scale and accessibility—while keeping
                room for broader formats where permitted.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 sm:mt-16 border-t border-white/10"></div>

        {/* FOUNDER NOTE */}
        <div className="mt-10 sm:mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">A note from the founder</h2>
          <p className="mt-4 text-white/70 leading-relaxed max-w-4xl">
            Forex Leagues is being built with a long-term market perspective and
            hands-on experience across trading and brokerage operations. The goal
            is to create competitions that feel fair, professional, and worth
            participating in—where performance speaks louder than marketing.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-white hover:bg-white/10 transition"
            >
              Contact us
            </a>
            <a
              href="/schedule"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-yellow-400 px-6 py-3 text-black font-semibold hover:opacity-90 transition"
            >
              Join a tournament
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}