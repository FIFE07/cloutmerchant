import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatNairaFromKobo } from "@/lib/format";
import { SignOutButton } from "@/components/SignOutButton";
import { Logo } from "@/components/Logo";

/**
 * Dashboard overview (Week 1 minimal version — wallet card + sign-out).
 * Funding, orders and tickets land here in Week 2/3.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, wallet_balance_kobo")
    .eq("id", user.id)
    .single();

  const name = profile?.display_name || "there";

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="border-b border-cream-200 bg-cream-50/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Welcome, {name} 👋
        </h1>
        <p className="mt-2 text-ink-muted">Your account is live and your email is confirmed.</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-[var(--radius-card)] bg-charcoal-900 p-7 text-ink-on-dark shadow-sm">
            <p className="text-sm text-ink-on-dark-muted">Wallet balance</p>
            <p className="mt-2 font-display text-4xl font-bold text-amber-glow-400">
              {formatNairaFromKobo(profile?.wallet_balance_kobo ?? 0)}
            </p>
            <p className="mt-3 text-xs text-ink-on-dark-muted">
              Funding (card & bank transfer) arrives in the next build phase.
            </p>
          </div>
          <Link
            href="/services"
            className="group rounded-[var(--radius-card)] border border-cream-200 bg-surface-raised p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="font-display text-lg font-semibold text-ink group-hover:text-amber-glow-600">
              Browse the catalogue →
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              See every service and price across Instagram, TikTok, YouTube, X,
              Facebook and Telegram.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
