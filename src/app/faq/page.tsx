import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata(
  "Frequently asked questions",
  "Straight answers about CLOUTMERCHANT wallets, orders, delivery times, safety and refunds.",
);

type Faq = { q: string; a: string };
type Section = { title: string; items: Faq[] };

const SECTIONS: Section[] = [
  {
    title: "Getting started",
    items: [
      {
        q: "What is CLOUTMERCHANT?",
        a: "A social-media growth panel. You top up a wallet, pick a service (followers, likes, views, comments and more across all major platforms), paste the public link to your post or profile, and we deliver. No technical skills needed — if you can copy a link, you can place an order.",
      },
      {
        q: "Do I need an account to see prices?",
        a: "No. The full catalogue with prices, quantity limits and refill info is public on the Services page. You only create an account when you want to order.",
      },
      {
        q: "How do I create an account?",
        a: "Click Sign up, enter your email and a password, confirm the email we send you, and you're in. The whole thing takes about a minute. We never ask for your social-media passwords.",
      },
      {
        q: "Which platforms do you cover?",
        a: "Instagram, TikTok, Facebook, YouTube, X (Twitter), Telegram, Spotify, Snapchat, LinkedIn, Twitch, Discord, WhatsApp and more. Use the Category dropdown on the New order page — each platform has sub-categories (followers, likes, views…) and then specific services inside them.",
      },
      {
        q: "Which countries do you work in?",
        a: "Everywhere. Our focus is West Africa (Nigeria, Ghana and neighbours) with local payment options, and we also fully support the UK, EU and the rest of the world with card payments.",
      },
    ],
  },
  {
    title: "Wallet & payments",
    items: [
      {
        q: "How does the wallet work?",
        a: "You top up once by card or bank transfer through our payment partners (Paystack for Africa, Stripe for UK/EU/international cards). Each order then debits your balance — you see the exact cost before confirming. We never see or store your card number.",
      },
      {
        q: "What payment methods do you accept?",
        a: "Debit/credit cards (Visa, Mastercard, Verve), bank transfer and USSD via Paystack, plus international cards via Stripe. All payments are processed by the payment provider — card details never touch our servers.",
      },
      {
        q: "What is the minimum top-up?",
        a: "You can start small — the Add funds page has quick amounts from ₦1,000 upward, and you can type any custom amount. There is no subscription and no monthly fee; you only spend what you load.",
      },
      {
        q: "My payment succeeded but my balance didn't update. What do I do?",
        a: "Balances normally credit within seconds. If yours hasn't after 5 minutes, open a ticket with your payment reference and the amount — we reconcile every payment and credit anything that's missing. You will never lose money you paid.",
      },
      {
        q: "Can I get my money back out of the wallet?",
        a: "Wallet balances are for spending on services. If you topped up by mistake or a payment was unauthorised, contact support within 14 days — our Refund Policy covers exactly how that works.",
      },
      {
        q: "What currency are prices in?",
        a: "Prices are shown in Naira (₦). International customers pay by card and their bank handles the conversion automatically at the normal exchange rate.",
      },
    ],
  },
  {
    title: "Placing an order",
    items: [
      {
        q: "How do I place an order?",
        a: "New order → choose a Category (the platform, e.g. Instagram) → choose a Sub-category (e.g. Instagram Followers) → choose a Service → paste the public link → enter the quantity → the exact charge is shown before you confirm. That's it.",
      },
      {
        q: "What link do I paste?",
        a: "The public link to what you want boosted: a profile URL for followers, a post URL for likes/comments, a video URL for views. Never your password — we will never ask for it, and you should never share it with anyone.",
      },
      {
        q: "Why does my account/post need to be public?",
        a: "Delivery systems can't reach private accounts or posts. Set the account or post to public before ordering; you can switch back after delivery completes.",
      },
      {
        q: "What do Min and Max mean?",
        a: "Every service has a minimum and maximum quantity per order (shown on the Services page and while ordering). Want more than the max? Place multiple orders.",
      },
      {
        q: "Can I order the same link twice?",
        a: "Yes, but wait until the previous order on that link shows Completed — running two follower orders on the same profile at once can slow or confuse delivery.",
      },
      {
        q: "Can I cancel an order?",
        a: "If it hasn't started processing yet, open a ticket and we'll cancel and refund it. Once a provider has started delivery, it can't be stopped — but any undelivered remainder is refunded automatically.",
      },
    ],
  },
  {
    title: "Delivery, quality & drops",
    items: [
      {
        q: "How fast is delivery?",
        a: "Most services start within minutes to a few hours. Speed depends on provider capacity and the platform; large orders are usually delivered gradually to look natural. You can watch live status (Pending → Processing → Completed) in your Orders page.",
      },
      {
        q: "What do the quality badges mean?",
        a: "👑 Premium = highest quality, real-looking accounts, lowest drop rate. ⭐ Standard = balanced quality and price. 💰 Budget = cheapest available, drops can happen. 🎁 Free = free services when available. Pick the tier that matches your budget and how permanent you need the numbers to be.",
      },
      {
        q: "What are 'drops' and 'no-drop'?",
        a: "Platforms sometimes clean up paid engagement, so numbers can fall after delivery — that's a drop. Services marked no-drop or with ✓ Refill are built to stick, and refillable services replace dropped numbers free within the refill window.",
      },
      {
        q: "How does Refill work?",
        a: "If a service shows ✓ Refill and your numbers drop within the refill period, open a ticket (or use the refill option on the order) and we top the count back up at no charge. Budget services without refill are cheaper precisely because drops aren't covered.",
      },
      {
        q: "Why did my order get stuck on Pending?",
        a: "Usually one of: the link is private, the link format is wrong, or the provider queue is busy. Check the link is public and correct; if it's still stuck after a few hours, open a ticket and we'll push it through or refund it.",
      },
      {
        q: "Will my followers/likes look real?",
        a: "Premium services use the most realistic accounts available. Budget services prioritise price over polish. If appearance matters (a business page, an artist profile), choose Premium — the badge guide on the Services page explains each tier in one line.",
      },
    ],
  },
  {
    title: "Safety & rules",
    items: [
      {
        q: "Is this safe for my social account?",
        a: "We never ask for passwords — only public links. That said, paid engagement can conflict with platform rules, and platforms may remove it. Millions of orders run every day without issue, but the risk is yours to take; our Terms explain it plainly. Ordering gradually rather than huge one-off spikes is the sensible approach.",
      },
      {
        q: "Will anyone know I used this?",
        a: "No. Orders are private, your email and order history are visible only to you, and we never contact your audience or post anything anywhere.",
      },
      {
        q: "What do you do with my data?",
        a: "The minimum needed to run your account: email, orders, wallet transactions. Payment card details are handled entirely by Paystack/Stripe. See our Privacy Policy for the full detail.",
      },
    ],
  },
  {
    title: "Refunds",
    items: [
      {
        q: "What if my order fails?",
        a: "You never pay for what wasn't delivered. Failed orders are refunded to your wallet automatically, and partial deliveries are refunded for the undelivered part. See our Refund Policy for the full rules.",
      },
      {
        q: "How long do refunds take?",
        a: "Wallet refunds are instant and automatic. Top-up reversals to your card or bank follow the payment provider's timeline (typically 1–10 business days depending on your bank).",
      },
    ],
  },
  {
    title: "Resellers & API",
    items: [
      {
        q: "Do you offer reseller rates?",
        a: "Yes — reseller accounts get discounted pricing across the whole catalogue. If you plan to run your own panel or fulfil orders for clients, open a ticket and we'll switch your account to reseller pricing.",
      },
      {
        q: "Do you have an API?",
        a: "Yes. Every account gets an API key (Dashboard → API) to place orders, check status and pull the service list programmatically — compatible with standard SMM-panel API format, so existing tools and scripts plug straight in.",
      },
      {
        q: "Can I build my own shop on top of CLOUTMERCHANT?",
        a: "That's exactly what the API is for. Connect your panel to our API, set your own prices for your customers, and orders flow through automatically.",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        q: "How do I contact support?",
        a: "Dashboard → Tickets. Describe the issue and include the order ID if it's about an order. We answer tickets in order; including the order ID and the link you used gets you a faster fix.",
      },
      {
        q: "Something looks wrong on the site. What should I try first?",
        a: "Refresh the page, then sign out and back in. If it's still wrong, open a ticket with a screenshot — we fix issues quickly and we'd rather hear about it twice than never.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <LegalPage title="Frequently asked questions" updated="14 September 2026">
      <div className="space-y-12">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="!text-xl !text-amber-glow-400">{s.title}</h2>
            <div className="mt-5 space-y-7">
              {s.items.map((f) => (
                <div key={f.q}>
                  <h3 className="font-display text-base font-semibold text-ink-on-dark">{f.q}</h3>
                  <p className="mt-1.5">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </LegalPage>
  );
}
