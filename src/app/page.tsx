import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { createClient } from "@/lib/supabase/server";
import { formatNairaFromKobo } from "@/lib/format";

export const revalidate = 60; // catalogue changes propagate within a minute

const STEPS = [
  {
    title: "Create your account",
    body: "Sign up with your email in under a minute. Confirm the email we send you and you're in.",
  },
  {
    title: "Fund your wallet",
    body: "Top up once by card or bank transfer. Your balance is yours — spend it across any service, any time.",
  },
  {
    title: "Place an order",
    body: "Pick a service, paste your link, choose a quantity. You see the exact cost before anything is charged.",
  },
  {
    title: "Track it live",
    body: "Every order moves through pending → processing → completed in your dashboard, with a full history.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, slug, sort_order, services(count)")
    .eq("is_active", true)
    .order("sort_order");

  // Cheapest active service per category for an honest "from ₦X" label
  const { data: cheapest } = await supabase
    .from("services")
    .select("category_id, price_per_1000_kobo")
    .eq("is_active", true)
    .order("price_per_1000_kobo");

  const fromPrice = new Map<string, number>();
  for (const row of cheapest ?? []) {
    if (!fromPrice.has(row.category_id)) {
      fromPrice.set(row.category_id, row.price_per_1000_kobo);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-charcoal-900 text-ink-on-dark">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <p className="inline-block rounded-full border border-charcoal-700 px-4 py-1.5 text-xs font-medium tracking-wide text-teal-pop-300">
            Social growth services · one wallet · real tracking
            </p>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
              Your social presence,{" "}
              <span className="text-amber-glow-400">turned up.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-on-dark-muted">
              CLOUTMERCHANT puts followers, likes, views and more for Instagram,
              TikTok, YouTube, X, Facebook and Telegram in one place — paid from
              a single wallet you top up once.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-2xl bg-amber-glow-400 px-7 py-3.5 font-display text-base font-semibold text-charcoal-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-glow-300"
              >
                Create free account
              </Link>
              <Link
                href="/services"
                className="rounded-2xl border border-charcoal-700 px-7 py-3.5 font-display text-base font-semibold text-ink-on-dark transition hover:border-teal-pop-400 hover:text-teal-pop-300"
              >
                Browse services
              </Link>
            </div>
            <p className="mt-6 text-xs text-ink-on-dark-muted">
              No card needed to look around. Prices are public before you sign up.
            </p>
          </div>
        </section>

        {/* Category grid — live from the database */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Every platform, one catalogue
          </h2>
          <p className="mt-3 max-w-2xl text-ink-muted">
            Straight answers on price, speed and quantity limits — before you
            spend a kobo.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(categories ?? []).map((cat) => {
              const count = (cat.services as unknown as { count: number }[])?.[0]?.count ?? 0;
              const from = fromPrice.get(cat.id);
              return (
                <Link
                  key={cat.id}
                  href={`/services?platform=${cat.slug}`}
                  className="group rounded-[var(--radius-card)] border border-cream-200 bg-surface-raised p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <h3 className="font-display text-lg font-semibold text-ink group-hover:text-amber-glow-600">
                    {cat.name}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted">
                    {count} service{count === 1 ? "" : "s"}
                    {from ? ` · from ${formatNairaFromKobo(from)} / 1000` : ""}
                  </p>
                  <span className="mt-4 inline-block text-sm font-medium text-teal-pop-500">
                    View services →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-cream-100">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              How it works
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className="rounded-[var(--radius-card)] bg-surface-raised p-6 shadow-sm"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-charcoal-900 font-display text-base font-bold text-amber-glow-400">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Honest expectations */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="rounded-[var(--radius-card)] border border-teal-pop-300 bg-teal-pop-300/10 p-8">
            <h2 className="font-display text-xl font-bold text-ink">
              We tell you the truth up front
            </h2>
            <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-ink-muted sm:grid-cols-3">
              <li>Delivery times are estimates, not promises — we show the real status of every order.</li>
              <li>Third-party platforms can remove paid engagement; we explain that risk before you buy.</li>
              <li>You'll always see the exact charge before you confirm. No hidden fees, ever.</li>
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-charcoal-900 text-center text-ink-on-dark">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="font-display text-3xl font-bold tracking-tight">
              Ready when you are.
            </h2>
            <p className="mt-3 text-ink-on-dark-muted">
              Free account. Public prices. Your wallet, your pace.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-block rounded-2xl bg-amber-glow-400 px-8 py-4 font-display text-base font-semibold text-charcoal-900 transition hover:-translate-y-0.5 hover:bg-amber-glow-300"
            >
              Get started free
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
