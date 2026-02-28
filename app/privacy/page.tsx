export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* HERO */}
        <div className="rounded-2xl border border-white/15 bg-white/7 p-8 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Privacy Policy
          </h1>

          <p className="mt-3 text-sm text-white/60">
            Last updated: March 2026
          </p>

          <p className="mt-6 text-base sm:text-lg text-white/85 leading-relaxed">
            Forex Leagues (“we”, “our”, “us”) is committed to protecting your
            privacy and safeguarding your personal information. This Privacy
            Policy explains how we collect, use, disclose, and protect
            information when you use our website and competition platform.
          </p>
        </div>

        {/* CONTENT */}
        <div className="mt-10 space-y-8 text-white/85 leading-relaxed">

          {/* SECTION */}
          <Section title="1. Information We Collect">
            <p>
              We may collect the following categories of information:
            </p>

            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Full name, email address, and optional phone number</li>
              <li>Username and account registration details</li>
              <li>Tournament participation and demo performance data</li>
              <li>Messages submitted through contact forms</li>
              <li>IP address, browser type, and device information</li>
              <li>Cookies and basic usage analytics</li>
            </ul>

            <p className="mt-4">
              We do not currently collect payment card information. If paid
              competitions are introduced in the future, payments will be
              processed securely through third-party providers.
            </p>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc ml-6 space-y-2">
              <li>Create and manage user accounts</li>
              <li>Operate and administer trading competitions</li>
              <li>Verify identity and prevent abuse or multi-accounting</li>
              <li>Publish rankings and competition results</li>
              <li>Communicate important platform updates</li>
              <li>Improve platform functionality and security</li>
              <li>Comply with applicable legal obligations</li>
            </ul>
          </Section>

          <Section title="3. Sharing of Information">
            <p>We do not sell personal information.</p>

            <p className="mt-4">
              We may share limited information under the following circumstances:
            </p>

            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>
                With trusted service providers (hosting, database, analytics,
                infrastructure).
              </li>
              <li>
                With tournament sponsors or brokerage partners strictly for
                prize fulfillment or compliance purposes.
              </li>
              <li>
                If required by law, regulation, or court order.
              </li>
            </ul>
          </Section>

          <Section title="4. International Data Transfers">
            <p>
              Forex Leagues may operate globally. By using the platform, you
              understand that your information may be processed outside your
              country of residence, including Canada and other jurisdictions.
              We implement reasonable safeguards to protect such transfers.
            </p>
          </Section>

          <Section title="5. Data Security">
            <p>
              We implement reasonable administrative, technical, and
              organizational safeguards designed to protect personal
              information. These include secure hosting environments, access
              controls, and monitoring systems.
            </p>

            <p className="mt-4">
              However, no system can be guaranteed completely secure. Use of the
              platform is at your own risk.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain personal information for as long as necessary to
              maintain accounts, operate competitions, comply with legal
              obligations, and resolve disputes.
            </p>

            <p className="mt-4">
              Aggregated or anonymized data may be retained indefinitely.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>
              Depending on your jurisdiction, you may have the right to:
            </p>

            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Request access to your personal information</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account</li>
              <li>Withdraw consent where applicable</li>
            </ul>

            <p className="mt-4">
              To exercise these rights, contact us at:
            </p>

            <p className="mt-2 font-medium text-yellow-400">
              support@forexleagues.com
            </p>
          </Section>

          <Section title="8. Cookies & Analytics">
            <p>
              We may use cookies and basic analytics tools to improve user
              experience and monitor platform performance. You may disable
              cookies through your browser settings, though some features may
              not function properly.
            </p>
          </Section>

          <Section title="9. Children’s Privacy">
            <p>
              The platform is not intended for individuals under the legal age
              in their jurisdiction. We do not knowingly collect personal
              information from minors.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Changes will
              become effective upon posting the updated version with a revised
              “Last updated” date.
            </p>
          </Section>

          <Section title="11. Contact Information">
            <p>
              For privacy-related inquiries:
            </p>

            <p className="mt-3">
              Email:{" "}
              <span className="text-yellow-400">
                support@forexleagues.com
              </span>
            </p>

            <p className="mt-1">
              Website: www.forexleagues.com
            </p>
          </Section>

        </div>
      </div>
    </main>
  );
}

/* SECTION COMPONENT */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-white">
        {title}
      </h2>
      <div className="mt-4 text-white/80 text-sm sm:text-base">
        {children}
      </div>
    </section>
  );
}