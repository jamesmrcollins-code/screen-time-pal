import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="text-sm text-primary hover:underline">&larr; Back</Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: 7 May 2026</p>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-xl font-semibold">1. Who we are</h2>
          <p>
            ScreenTime Pal is operated by James Collins, a sole trader based in
            England, United Kingdom, trading as "ScreenTime Pal" ("we", "us", "our").
            By creating an account or using the ScreenTime Pal app or website (the
            "Service"), you ("you", "user") agree to these Terms.
          </p>

          <h2 className="text-xl font-semibold pt-4">2. Eligibility</h2>
          <p>
            You must be at least 18 years old (or the age of majority in your country)
            to create an account. If you are using the Service on behalf of a household
            or organisation, you confirm you have authority to do so.
          </p>

          <h2 className="text-xl font-semibold pt-4">3. The Service</h2>
          <p>
            ScreenTime Pal helps families track and manage children's screen time,
            including timers, schedules, rewards, bonus tasks, statistics, and family
            sharing. Some features require a Premium subscription or one-time
            purchase.
          </p>

          <h2 className="text-xl font-semibold pt-4">4. Your account</h2>
          <p>
            You are responsible for keeping your login credentials confidential and for
            all activity under your account. You must provide accurate information and
            keep it up to date. Notify us at support@screentimepal.io if you suspect
            unauthorised access.
          </p>

          <h2 className="text-xl font-semibold pt-4">5. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use the Service for any unlawful, fraudulent, or harmful purpose.</li>
            <li>Send spam, malware, or attempt to interfere with the security of the Service.</li>
            <li>Reverse engineer, decompile, scrape, or copy the Service.</li>
            <li>Resell, redistribute, or sublicense the Service.</li>
            <li>Infringe the intellectual property or privacy rights of others.</li>
            <li>Circumvent technical limits, rate limits, or paid features.</li>
          </ul>

          <h2 className="text-xl font-semibold pt-4">6. Licence</h2>
          <p>
            We grant you a limited, non-exclusive, non-transferable, revocable right to
            use the Service for your personal, household use within the plan you have
            purchased.
          </p>

          <h2 className="text-xl font-semibold pt-4">7. Intellectual property</h2>
          <p>
            All software, branding, designs, and content of the Service belong to James
            Collins (or his licensors) and are protected by intellectual property law.
            Nothing in these Terms transfers ownership to you.
          </p>

          <h2 className="text-xl font-semibold pt-4">8. Payments &amp; subscriptions</h2>
          <p>
            Our order process is conducted by our online reseller Paddle.com.
            Paddle.com is the Merchant of Record for all our orders. Paddle provides
            all customer service inquiries and handles returns. Payment, billing, tax,
            cancellation, and refund mechanics are governed by the{" "}
            <a href="https://www.paddle.com/legal/checkout-buyer-terms" className="text-primary hover:underline" target="_blank" rel="noreferrer">
              Paddle Buyer Terms
            </a>
            . Subscriptions renew automatically until cancelled. You can manage or
            cancel your subscription at any time via paddle.net or the link in your
            purchase receipt.
          </p>

          <h2 className="text-xl font-semibold pt-4">9. Refunds</h2>
          <p>
            We offer a 30-day money-back guarantee. See our{" "}
            <Link to="/refund" className="text-primary hover:underline">Refund Policy</Link>{" "}
            for details.
          </p>

          <h2 className="text-xl font-semibold pt-4">10. Service availability</h2>
          <p>
            We work hard to keep the Service available but do not guarantee
            uninterrupted, timely, or error-free performance. We may modify, suspend,
            or discontinue features at any time.
          </p>

          <h2 className="text-xl font-semibold pt-4">11. Suspension &amp; termination</h2>
          <p>
            We may suspend or terminate your account if you materially breach these
            Terms, fail to pay, pose a security or fraud risk, or repeatedly violate
            our policies. You may close your account at any time from the Profile
            page. On termination, your access ends and your data will be deleted in
            accordance with our Privacy Notice.
          </p>

          <h2 className="text-xl font-semibold pt-4">12. Warranties &amp; liability</h2>
          <p>
            To the fullest extent permitted by law, the Service is provided "as is"
            without warranties of any kind, whether express or implied. We do not
            exclude liability for fraud, death or personal injury caused by our
            negligence, or any other liability that cannot be excluded under English
            law. Subject to that, our total aggregate liability arising out of or in
            connection with the Service is limited to the fees you paid us in the 12
            months before the event giving rise to the claim. We are not liable for
            indirect, consequential, or special damages, including loss of profits,
            data, or goodwill.
          </p>

          <h2 className="text-xl font-semibold pt-4">13. Indemnity</h2>
          <p>
            You agree to indemnify us against claims arising from your misuse of the
            Service, your content, or your breach of these Terms.
          </p>

          <h2 className="text-xl font-semibold pt-4">14. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. Material changes will be
            communicated by email or in-app. Continued use after changes take effect
            means you accept the updated Terms.
          </p>

          <h2 className="text-xl font-semibold pt-4">15. Governing law</h2>
          <p>
            These Terms are governed by the laws of England and Wales, and the courts
            of England and Wales have exclusive jurisdiction over any dispute, save
            that consumers may bring claims in the courts of their country of
            residence where required by mandatory law.
          </p>

          <h2 className="text-xl font-semibold pt-4">16. Contact</h2>
          <p>James Collins, England, United Kingdom. Email: support@screentimepal.io.</p>
        </section>
      </div>
    </main>
  );
};

export default Terms;