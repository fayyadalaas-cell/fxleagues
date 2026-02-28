export const dynamic = "force-dynamic";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        
        {/* HERO */}
        <div className="rounded-2xl border border-white/15 bg-white/7 p-6 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Contact Forex Leagues
          </h1>

          <p className="mt-2 text-sm sm:text-base text-white/60">
            Support • Partnerships • General inquiries
          </p>

          <p className="mt-4 text-base sm:text-lg text-white/85 max-w-3xl leading-relaxed">
            Have a question, partnership inquiry, or need support?
            Send us a message and we’ll get back to you.
          </p>
        </div>

        {/* CONTENT */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">

          {/* LEFT SIDE */}
          <section className="rounded-2xl border border-white/15 bg-white/7 p-6 flex flex-col">
            <div>
              <h2 className="text-lg font-semibold">Reach us</h2>
              <p className="mt-2 text-sm text-white/60">
                Fastest way to reach the team.
              </p>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-white/15 bg-black/30 p-4">
                  <div className="text-white/90 font-semibold">Email</div>
                  <div className="mt-1 text-white/80">
                    support@forexleagues.com
                  </div>
                </div>

                <div className="rounded-xl border border-white/15 bg-black/30 p-4">
                  <div className="text-white/90 font-semibold">Partnerships</div>
                  <div className="mt-1 text-white/80">
                    partners@forexleagues.com
                  </div>
                </div>

                <div className="rounded-xl border border-white/15 bg-black/30 p-4">
                  <div className="text-white/90 font-semibold">Response time</div>
                  <div className="mt-1 text-white/80">
                    Typically within 24–48 hours
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom note pinned */}
            <div className="mt-auto pt-6 border-t border-white/10 text-sm text-white/65 leading-relaxed">
              Please avoid sharing sensitive account information by email.
              If you need help with a tournament entry, include your username
              and the tournament name.
            </div>
          </section>

          {/* RIGHT SIDE FORM */}
          <section className="lg:col-span-2 rounded-2xl border border-white/15 bg-white/7 p-6 sm:p-8 flex flex-col">
            <div>
              <h2 className="text-lg font-semibold">Send a message</h2>
              <p className="mt-2 text-sm text-white/60">
                Fill out the form below and we’ll respond as soon as possible.
              </p>

              <form className="mt-6 space-y-4">

                {/* NAME + EMAIL */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-white/75">Name</label>
                    <input
                      className="mt-2 w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-white placeholder:text-white/45 outline-none focus:border-yellow-400/70"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/75">Email</label>
                    <input
                      type="email"
                      className="mt-2 w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-white placeholder:text-white/45 outline-none focus:border-yellow-400/70"
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div>
                  <label className="text-sm text-white/75">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    pattern="^\+?[0-9\s\-]{7,20}$"
                    className="mt-2 w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-white placeholder:text-white/45 outline-none focus:border-yellow-400/70"
                    placeholder="+1 234 567 890"
                  />
                  <p className="mt-1 text-xs text-white/50">
                    Include country code if outside your region.
                  </p>
                </div>

                {/* SUBJECT */}
                <div>
                  <label className="text-sm text-white/75">Subject</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-white placeholder:text-white/45 outline-none focus:border-yellow-400/70"
                    placeholder="How can we help?"
                  />
                </div>

                {/* MESSAGE */}
                <div>
                  <label className="text-sm text-white/75">Message</label>
                  <textarea
                    rows={6}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-white placeholder:text-white/45 outline-none focus:border-yellow-400/70"
                    placeholder="Write your message..."
                  />
                </div>

              </form>
            </div>

            {/* Button + Privacy pinned bottom */}
            <div className="mt-auto pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-white/60">
                By contacting us, you agree to our{" "}
                <a
                  href="/privacy"
                  className="text-yellow-400 hover:underline"
                >
                  Privacy Policy
                </a>.
              </div>

              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-yellow-400 px-6 py-3 text-black font-semibold hover:opacity-90 transition"
              >
                Send message
              </button>
            </div>

            <div className="mt-3 text-xs text-white/50">
              Note: This form is currently UI-only. We can connect it to email
              or a database in the next step.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}