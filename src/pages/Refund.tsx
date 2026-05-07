import { Link } from "react-router-dom";

const Refund = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="text-sm text-primary hover:underline">&larr; Back</Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: 7 May 2026</p>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-xl font-semibold">30-day money-back guarantee</h2>
          <p>
            We want you to be happy with ScreenTime Pal. If you are not satisfied with
            your purchase, you can request a full refund within <strong>30 days</strong>{" "}
            of your order date — no questions asked. This applies to monthly, yearly,
            and lifetime purchases.
          </p>

          <h2 className="text-xl font-semibold pt-4">How to request a refund</h2>
          <p>
            Refunds are processed by our payment provider and Merchant of Record,
            Paddle. To request a refund:
          </p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              Visit{" "}
              <a href="https://paddle.net" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                paddle.net
              </a>{" "}
              and look up your order using the email you used at checkout, or
            </li>
            <li>
              Email us at{" "}
              <a href="mailto:support@screentimepal.io" className="text-primary hover:underline">
                support@screentimepal.io
              </a>{" "}
              with your order ID, and we will help you arrange the refund through
              Paddle.
            </li>
          </ol>

          <h2 className="text-xl font-semibold pt-4">After 30 days</h2>
          <p>
            After the 30-day window, refunds are at our discretion and Paddle's, and
            may be granted in exceptional circumstances (for example, technical issues
            we cannot resolve). You can cancel an active subscription at any time from
            paddle.net to stop future renewals.
          </p>

          <h2 className="text-xl font-semibold pt-4">More information</h2>
          <p>
            Refunds are also subject to the{" "}
            <a href="https://www.paddle.com/legal/refund-policy" target="_blank" rel="noreferrer" className="text-primary hover:underline">
              Paddle Refund Policy
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
};

export default Refund;