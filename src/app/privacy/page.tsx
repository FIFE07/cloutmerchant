import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata(
  "Privacy Policy",
  "How CLOUTMERCHANT collects, uses and protects your personal data, and your rights under UK GDPR.",
);

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="5 August 2026">
      <p>
        This policy explains what personal data CLOUTMERCHANT collects, why, and
        the rights you have over it. We follow the UK GDPR and the Data Protection
        Act 2018. We collect the minimum needed to run the Service.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> your email address, display name and password (stored only as a secure hash by our authentication provider).</li>
        <li><strong>Order data:</strong> the services you order, target links you paste, quantities, charges and order status history.</li>
        <li><strong>Transaction data:</strong> wallet top-ups and spending. Payments are handled by Paystack or Stripe — <strong>we never see or store your full card number</strong>; we receive only a payment reference and status.</li>
        <li><strong>Support data:</strong> tickets and messages you send us.</li>
        <li><strong>Usage data:</strong> privacy-respecting product analytics (page views, feature usage) collected via PostHog or a similar tool, used only to improve the Service. No advertising trackers.</li>
      </ul>

      <h2>2. Why we use it (lawful bases)</h2>
      <ul>
        <li><strong>Contract:</strong> to run your account, process orders and payments, and provide support.</li>
        <li><strong>Legitimate interests:</strong> to keep the Service secure, prevent fraud, and improve it.</li>
        <li><strong>Legal obligation:</strong> to keep financial records as required by law.</li>
        <li><strong>Consent:</strong> for anything optional, such as marketing email — which we only send if you explicitly opt in.</li>
      </ul>

      <h2>3. Who we share it with</h2>
      <ul>
        <li>Infrastructure providers that run the Service (database/hosting: Supabase and Vercel; email: Resend; payments: Paystack/Stripe; analytics: PostHog) — each under a data-processing agreement and only as instructed by us.</li>
        <li>Fulfilment providers receive only the target link and quantity needed to deliver your order — never your email, password or payment details.</li>
        <li>We never sell your personal data.</li>
      </ul>

      <h2>4. Your rights</h2>
      <p>
        You can request access, correction, export or deletion of your personal
        data, and object to or restrict certain processing. You can delete your
        account yourself in Settings — that permanently deletes or anonymises
        your personal data, except records we must keep by law (for example
        transaction records). To exercise any right, open a support ticket.
      </p>

      <h2>5. Retention and security</h2>
      <p>
        Account data is kept while your account is active. Financial transaction
        records are kept for the period required by tax and accounting law.
        We use encryption in transit, row-level access controls in our database,
        and server-side-only secrets. No system is perfectly secure, but we
        design for breach minimisation: we hold no card numbers and no unnecessary data.
      </p>

      <h2>6. International transfers and complaints</h2>
      <p>
        Some providers process data outside the UK; where they do, we rely on
        adequacy regulations or standard contractual clauses. You may complain to
        the UK Information Commissioner's Office (ICO) at ico.org.uk — though we
        would appreciate the chance to fix things first via a support ticket.
      </p>
    </LegalPage>
  );
}
