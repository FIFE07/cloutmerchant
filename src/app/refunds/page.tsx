import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata(
  "Refund Policy",
  "When CLOUTMERCHANT refunds wallet top-ups and orders — plain language, no fine-print games.",
);

export default function RefundsPage() {
  return (
    <LegalPage title="Refund Policy" updated="5 August 2026">
      <p>
        We want refunds to be boring: clear rules, applied consistently. All
        refunds are made to your CLOUTMERCHANT wallet unless stated otherwise.
      </p>

      <h2>1. Orders</h2>
      <ul>
        <li><strong>Not started:</strong> if an order has not entered processing, you can cancel it and the full charge is returned to your wallet automatically.</li>
        <li><strong>Failed or partial delivery:</strong> if a provider cannot complete your order, the undelivered portion is refunded to your wallet automatically (a "partial" refund). You never pay for what was not delivered.</li>
        <li><strong>In progress:</strong> orders already processing usually cannot be cancelled, because fulfilment starts immediately. If delivery then fails, rule 2 applies.</li>
        <li><strong>Delivered as described:</strong> completed orders are not refundable. Delivery times are estimates, so a slower-than-estimated delivery that completes is not grounds for a refund.</li>
        <li><strong>Removed by the platform:</strong> if a third-party platform removes delivered engagement, we cannot reverse that — see our Terms. Where a service carries a refill mark, we will restore drops within the refill window at no cost.</li>
      </ul>

      <h2>2. Wallet top-ups</h2>
      <ul>
        <li>Wallet balances are generally non-withdrawable — they exist to spend on services.</li>
        <li>If you topped up by mistake, or a payment was taken without your authorisation, contact us within 14 days via a support ticket. Unspent, authorised top-ups may be returned to the original payment method at our discretion; unauthorised transactions are always refunded after verification.</li>
        <li>Chargebacks filed without contacting us first may lead to account suspension while we resolve them — talk to us, we respond quickly.</li>
      </ul>

      <h2>3. How to request</h2>
      <p>
        Open a support ticket in your dashboard with your order ID. Refunds to
        your wallet are instant once approved; refunds to a payment method depend
        on the processor and typically take 5–10 business days.
      </p>
    </LegalPage>
  );
}
