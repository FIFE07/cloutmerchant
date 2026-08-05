import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata(
  "Frequently asked questions",
  "Straight answers about CLOUTMERCHANT wallets, orders, delivery times, safety and refunds.",
);

const FAQS = [
  {
    q: "Do I need an account to see prices?",
    a: "No. The full catalogue with prices, quantity limits and average delivery times is public on the Services page. You only create an account when you want to order.",
  },
  {
    q: "How does the wallet work?",
    a: "You top up once by card or bank transfer through our payment partners (Paystack or Stripe). Each order then debits your balance — you see the exact cost before confirming. We never see or store your card number.",
  },
  {
    q: "How fast is delivery?",
    a: "Every service shows an average delivery estimate. These are honest estimates, not promises — actual speed depends on provider capacity and the target platform. You can watch the real status of every order in your dashboard.",
  },
  {
    q: "Is this safe for my social account?",
    a: "We never ask for your social-media passwords — only the public link to the post or profile you want to promote. However, engagement services can conflict with third-party platform rules, and platforms may remove paid engagement. That risk is yours to take; our Terms explain it plainly.",
  },
  {
    q: "What if my order fails?",
    a: "You never pay for what wasn't delivered. Failed or partially delivered orders are automatically refunded to your wallet for the undelivered part. See our Refund Policy for the full rules.",
  },
  {
    q: "Can I get my money back out of the wallet?",
    a: "Wallet balances are for spending on services. If you topped up by mistake or a payment was unauthorised, contact support within 14 days — our Refund Policy covers exactly how that works.",
  },
  {
    q: "Do you offer an API for resellers?",
    a: "Yes — resellers get discounted rates and an API key to place orders programmatically. Create an account, then visit the API section of the dashboard.",
  },
];

export default function FaqPage() {
  return (
    <LegalPage title="Frequently asked questions" updated="5 August 2026">
      <div className="space-y-8">
        {FAQS.map((f) => (
          <div key={f.q}>
            <h2 className="!text-lg">{f.q}</h2>
            <p className="mt-2">{f.a}</p>
          </div>
        ))}
      </div>
    </LegalPage>
  );
}
