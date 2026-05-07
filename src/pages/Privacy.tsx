import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="text-sm text-primary hover:underline">&larr; Back</Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Privacy Notice</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: 7 May 2026</p>

        <section className="space-y-4 text-sm leading-relaxed">
          <p>
            This Privacy Notice explains how James Collins, a sole trader trading as
            "ScreenTime Pal" ("we", "us", "our"), collects and uses your personal data
            when you use the ScreenTime Pal app and website (the "Service"). We are the
            data controller for the personal data described below.
          </p>

          <h2 className="text-xl font-semibold pt-4">1. Personal data we collect</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account data:</strong> email address, password (hashed), display name.</li>
            <li><strong>Profile and usage data:</strong> child profiles you create, screen-time limits, schedules, rewards, bonus tasks, usage logs you record in the app.</li>
            <li><strong>Device data:</strong> device identifiers, operating system, app version, push notification tokens (if you opt in).</li>
            <li><strong>Support data:</strong> messages you send to us by email.</li>
            <li><strong>Technical data:</strong> IP address, log data, basic diagnostics for security and reliability.</li>
          </ul>

          <h2 className="text-xl font-semibold pt-4">2. Why we use it (purposes &amp; legal basis)</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To create and manage your account and provide the Service — performance of a contract.</li>
            <li>To sync your data across devices and family members — performance of a contract.</li>
            <li>To send transactional emails (sign-in, password reset, receipts) — performance of a contract.</li>
            <li>To send push notifications you have enabled — consent (you can disable at any time).</li>
            <li>To prevent fraud and abuse, and keep the Service secure — legitimate interests.</li>
            <li>To improve the Service and fix bugs — legitimate interests.</li>
            <li>To comply with legal obligations (tax, accounting, lawful requests) — legal obligation.</li>
          </ul>

          <h2 className="text-xl font-semibold pt-4">3. Who we share data with</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Hosting and backend:</strong> Supabase (database, authentication, storage).</li>
            <li><strong>Merchant of Record:</strong> Paddle.com Market Limited handles all payments, subscription management, billing, tax compliance, invoicing, and refunds. Paddle is an independent data controller for payment data.</li>
            <li><strong>Push notifications:</strong> Apple Push Notification Service / Google Firebase Cloud Messaging (only if you enable notifications).</li>
            <li><strong>Professional advisers:</strong> our accountants and legal advisers where necessary.</li>
            <li><strong>Authorities:</strong> where required by law or to protect our rights.</li>
          </ul>
          <p>We do not sell your personal data.</p>

          <h2 className="text-xl font-semibold pt-4">4. International transfers</h2>
          <p>
            Some of our service providers are based outside the UK/EEA. Where data is
            transferred internationally, we rely on UK/EU adequacy decisions or Standard
            Contractual Clauses to ensure appropriate safeguards are in place.
          </p>

          <h2 className="text-xl font-semibold pt-4">5. Retention</h2>
          <p>
            We keep account and profile data for as long as your account is active. If
            you delete your account, we delete or anonymise your personal data within
            30 days, except where we are required to retain it for legal, tax or
            accounting reasons (typically up to 7 years for billing records held by
            Paddle and our accountants).
          </p>

          <h2 className="text-xl font-semibold pt-4">6. Your rights (UK GDPR)</h2>
          <p>You have the right to: access your data, correct inaccurate data, request
            erasure, restrict processing, data portability, object to processing,
            withdraw consent, and lodge a complaint with the UK Information
            Commissioner's Office (ico.org.uk). We will respond within one month.
            To exercise any of these rights, email us at support@screentimepal.io.
          </p>

          <h2 className="text-xl font-semibold pt-4">7. Security</h2>
          <p>
            We use appropriate technical and organisational measures including
            encryption in transit (HTTPS), encrypted storage, hashed passwords, and
            access controls. No system is 100% secure, but we work hard to protect your
            data.
          </p>

          <h2 className="text-xl font-semibold pt-4">8. Cookies</h2>
          <p>
            We use only essential cookies and local storage required to keep you signed
            in and to remember your theme preference. We do not use advertising or
            third-party analytics cookies.
          </p>

          <h2 className="text-xl font-semibold pt-4">9. Children</h2>
          <p>
            ScreenTime Pal is intended for parents and guardians. Accounts must be held
            by an adult. Child profiles created in the app contain only the information
            the parent chooses to enter (such as a name and screen-time settings).
          </p>

          <h2 className="text-xl font-semibold pt-4">10. Contact</h2>
          <p>
            James Collins (sole trader), trading as ScreenTime Pal, England, United
            Kingdom. Email: support@screentimepal.io.
          </p>
        </section>
      </div>
    </main>
  );
};

export default Privacy;