import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata(
  "Terms of Service",
  "The terms that govern your use of CLOUTMERCHANT — wallet, orders, honest delivery expectations and your responsibilities.",
);

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="5 August 2026">
      <p>
        These terms govern your use of CLOUTMERCHANT ("we", "us", the "Service").
        By creating an account or placing an order, you agree to them. Read them
        carefully — they are written to be understood, not to hide things.
      </p>

      <h2>1. What the Service is</h2>
      <p>
        CLOUTMERCHANT lets you fund a wallet and use that balance to order
        social-media engagement services (for example followers, likes or views)
        for third-party platforms such as Instagram, TikTok, YouTube, X, Facebook
        and Telegram. We act as a reseller and coordinator of these services;
        delivery is performed by independent fulfilment providers.
      </p>

      <h2>2. Honest delivery terms</h2>
      <ul>
        <li>All delivery times shown are <strong>estimates</strong>, not guarantees. Actual speed depends on provider capacity and the target platform.</li>
        <li>We do not guarantee any outcome: no specific follower retention, engagement rate, monetisation result or account growth.</li>
        <li>Engagement services may violate the terms of the third-party platforms they target. <strong>You assume that risk.</strong> Platforms may remove delivered engagement, limit, or suspend accounts. We are not responsible for actions taken by third-party platforms against your accounts or content.</li>
        <li>We are not affiliated with, endorsed by, or connected to Instagram, TikTok, YouTube, X, Facebook or Telegram.</li>
      </ul>

      <h2>3. Your account and wallet</h2>
      <ul>
        <li>You must provide a valid email address and keep your credentials confidential. You are responsible for activity on your account.</li>
        <li>Wallet funds are prepayments for services on this platform only. They are not a deposit, do not earn interest, and are not transferable between users.</li>
        <li>Payments are processed by our payment partners (Paystack and Stripe). We never see or store your card number.</li>
      </ul>

      <h2>4. Orders</h2>
      <ul>
        <li>You must only order services for accounts and content you own or are authorised to promote.</li>
        <li>Once an order enters processing it generally cannot be cancelled, because fulfilment starts immediately. See our Refund Policy for what happens if delivery fails.</li>
        <li>Orders for content that is illegal, or that promotes harm, hate or fraud, will be refused and may result in account closure.</li>
      </ul>

      <h2>5. Acceptable use</h2>
      <p>
        You agree not to abuse the Service: no fraud, no chargeback abuse, no
        reselling through unofficial channels, no attempts to probe or disrupt
        our systems, and no use of the API contrary to its documented rate limits.
      </p>

      <h2>6. Liability</h2>
      <p>
        To the maximum extent permitted by law, the Service is provided "as is".
        Our total liability to you for any claim is limited to the amount you
        paid into your wallet in the 90 days before the claim. Nothing in these
        terms excludes liability that cannot be excluded by law.
      </p>

      <h2>7. Changes and contact</h2>
      <p>
        We may update these terms; material changes will be announced in your
        dashboard before they take effect. Questions? Open a support ticket in
        your dashboard or email us via the address shown in your account.
      </p>
    </LegalPage>
  );
}
