export const dynamic = "force-dynamic";

const LAST_UPDATED = "March 2026";
const SUPPORT_EMAIL = "support@forexleagues.com";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-7xl">
          {/* Hero */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-8 sm:p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Terms & Conditions
            </h1>
            <p className="mt-3 text-sm text-white/60">Last updated: {LAST_UPDATED}</p>

            <p className="mt-6 text-base sm:text-lg text-white/80 leading-relaxed">
              These Terms & Conditions (“Terms”) govern your access to and use of Forex Leagues
              (the “Platform”). By accessing or using the Platform, you agree to these Terms. If you
              do not agree, you must not use the Platform.
            </p>

            <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-white/75">
                Important: Trading and leveraged products involve significant risk. Forex Leagues is
                competition-focused and demo-first unless explicitly stated otherwise. Nothing on the
                Platform constitutes financial advice.
              </p>
            </div>
          </div>

          {/* TOC */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/3 p-6">
            <div className="text-sm font-semibold text-white mb-3">On this page</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-white/70">
              <a className="hover:text-white transition" href="#acceptance">1. Acceptance of Terms</a>
              <a className="hover:text-white transition" href="#purpose">2. Platform Purpose</a>
              <a className="hover:text-white transition" href="#eligibility">3. Eligibility & Jurisdiction</a>
              <a className="hover:text-white transition" href="#accounts">4. Account Responsibility</a>
              <a className="hover:text-white transition" href="#fairplay">5. Tournament Rules & Fair Play</a>
              <a className="hover:text-white transition" href="#prizes">6. Prizes</a>
              <a className="hover:text-white transition" href="#sponsors">7. Sponsors & Data Sharing</a>
              <a className="hover:text-white transition" href="#risk">8. Risk Disclaimer</a>
              <a className="hover:text-white transition" href="#noadvice">9. No Financial Advice</a>
              <a className="hover:text-white transition" href="#thirdparty">10. Third-Party Services</a>
              <a className="hover:text-white transition" href="#liability">11. Limitation of Liability</a>
              <a className="hover:text-white transition" href="#indemnity">12. Indemnification</a>
              <a className="hover:text-white transition" href="#termination">13. Suspension & Termination</a>
              <a className="hover:text-white transition" href="#changes">14. Changes to Terms</a>
              <a className="hover:text-white transition" href="#law">15. Governing Law</a>
              <a className="hover:text-white transition" href="#contact">16. Contact</a>
            </div>
          </div>

          {/* Sections */}
          <div className="mt-8 space-y-6">
            <CardSection id="acceptance" title="1. Acceptance of Terms">
              By accessing or using Forex Leagues (“Platform”), you agree to be bound by these Terms.
              If you do not agree, you must discontinue use of the Platform immediately.
            </CardSection>

            <CardSection id="purpose" title="2. Platform Purpose">
              Forex Leagues provides competitive trading tournaments designed for performance comparison
              and educational engagement. The Platform is competition-focused and demo-first unless explicitly
              stated otherwise. Nothing on this Platform constitutes financial, investment, legal, or tax advice.
            </CardSection>

            <CardSection id="eligibility" title="3. Eligibility & Jurisdiction">
              You must be of legal age in your jurisdiction to use the Platform. Participation is void where prohibited.
              It is your sole responsibility to ensure that accessing or participating in Forex Leagues is lawful in your
              place of residence. The Platform makes no representation that it is appropriate or available in all locations.
              Access may be restricted at our sole discretion.
            </CardSection>

            <CardSection id="accounts" title="4. Account Responsibility">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities
              conducted under your account. You agree not to create multiple accounts, manipulate rankings, exploit system
              vulnerabilities, or attempt to interfere with the integrity of any tournament.
            </CardSection>

            <CardSection id="fairplay" title="5. Tournament Rules & Fair Play">
              Each tournament may have specific rules regarding timelines, scoring, prizes, and eligibility. By joining a
              tournament, you agree to comply with those rules. Forex Leagues reserves the right to investigate suspicious
              activity and disqualify participants at its sole discretion.
            </CardSection>

            <CardSection id="prizes" title="6. Prizes">
              If a tournament includes prizes, prize eligibility and distribution may be subject to verification steps,
              compliance checks, and sponsor requirements (where applicable). We may modify, delay, substitute, or cancel
              prize distribution if fraud, technical errors, rule violations, regulatory concerns, or force majeure events occur.
            </CardSection>

            <CardSection id="sponsors" title="7. Sponsors & Data Sharing">
              Some tournaments may be sponsored by third parties (for example, brokerage partners). Where a tournament is
              sponsored, participant registration information may be shared with the sponsor for legitimate tournament-related
              purposes such as prize fulfilment, compliance checks, and partnership reporting. For more details, please review
              our Privacy Policy.
            </CardSection>

            <CardSection id="risk" title="8. Risk Disclaimer">
              Trading financial instruments involves substantial risk and may not be suitable for all individuals. You may
              lose capital. Forex Leagues is not responsible for any financial losses, missed opportunities, or decisions made
              by users. Participation in a tournament does not guarantee any outcome or profit.
            </CardSection>

            <CardSection id="noadvice" title="9. No Financial Advice">
              All content and information provided on the Platform is for informational and competition purposes only and should
              not be interpreted as advice. You should seek independent professional guidance before making financial decisions.
            </CardSection>

            <CardSection id="thirdparty" title="10. Third-Party Services">
              The Platform may reference or integrate third-party services, brokers, sponsors, or tools. Forex Leagues does not
              control third-party services and is not responsible for their policies, actions, performance, availability, or content.
            </CardSection>

            <CardSection id="liability" title="11. Limitation of Liability">
              To the maximum extent permitted by law, Forex Leagues shall not be liable for any indirect, incidental, consequential,
              special, or punitive damages arising out of or related to your use of the Platform. The Platform is provided “as is”
              without warranties of any kind, express or implied.
            </CardSection>

            <CardSection id="indemnity" title="12. Indemnification">
              You agree to indemnify and hold harmless Forex Leagues, its affiliates, partners, and employees from any claims,
              damages, liabilities, losses, and expenses arising from your use of the Platform or violation of these Terms.
            </CardSection>

            <CardSection id="termination" title="13. Suspension & Termination">
              We reserve the right to suspend or terminate your access to the Platform at any time, with or without notice, if we
              believe you have violated these Terms or engaged in misuse, fraud, or harmful conduct.
            </CardSection>

            <CardSection id="changes" title="14. Changes to Terms">
              We may update these Terms from time to time. Changes become effective upon posting the updated version. Continued use
              of the Platform after changes are posted constitutes acceptance of the updated Terms.
            </CardSection>

            <CardSection id="law" title="15. Governing Law">
              These Terms are governed by applicable laws without regard to conflict of law principles. Any disputes shall be resolved
              in the appropriate courts of competent jurisdiction.
            </CardSection>

            <CardSection id="contact" title="16. Contact">
              For inquiries related to these Terms, contact:{" "}
              <a className="text-yellow-400 hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
              .
            </CardSection>
          </div>
        </div>
      </div>
    </main>
  );
}

function CardSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-white/10 bg-white/3 p-6 sm:p-7"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm sm:text-base text-white/75 leading-relaxed">
        {children}
      </p>
    </section>
  );
}