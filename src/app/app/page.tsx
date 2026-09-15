import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PanelNav } from "@/components/PanelNav";
import { NewOrderForm } from "@/components/NewOrderForm";
import { formatNairaFromKobo } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Panel home — classic layout: navbar, stats row, New Order form, recent orders. */
export default async function PanelHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app");

  const [{ data: profile }, { count: orderCount }, { data: categories }, { data: recent }] =
    await Promise.all([
      supabase.from("profiles").select("display_name, wallet_balance_kobo").eq("id", user.id).single(),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("service_categories").select("id, name, slug").eq("is_active", true).order("sort_order"),
      supabase
        .from("orders")
        .select("id, quantity, status, created_at, services(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const balance = profile?.wallet_balance_kobo ?? 0;
  const firstName = (profile?.display_name || user.email || "").split(/[@\s]/)[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-charcoal-950 text-ink-on-dark">
      <PanelNav balanceKobo={balance} active="/app" />
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-5">
        {/* Greeting + quick actions */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">
              {greeting}, <span className="text-amber-glow-400">{firstName}</span> 👋
            </h1>
            <p className="mt-1 text-sm text-ink-on-dark-muted">
              What are we boosting today?
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/app/funds"
              className="rounded-lg bg-amber-glow-400 px-4 py-2 font-display text-sm font-bold text-charcoal-950 hover:bg-amber-glow-300"
            >
              + Add funds
            </Link>
            <Link
              href="/services"
              className="rounded-lg border border-charcoal-700 bg-charcoal-900 px-4 py-2 text-sm font-semibold text-ink-on-dark hover:bg-charcoal-800"
            >
              Browse services
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Link
            href="/app/funds"
            className="rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-5 transition hover:border-amber-glow-400/50"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-on-dark-muted">💰 Balance</p>
            <p className="mt-1 font-display text-2xl font-bold text-amber-glow-400">
              {formatNairaFromKobo(balance)}
            </p>
            <p className="mt-1 text-xs text-ink-on-dark-muted">Tap to top up</p>
          </Link>
          <Link
            href="/app/orders"
            className="rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-5 transition hover:border-amber-glow-400/50"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-on-dark-muted">📦 Total orders</p>
            <p className="mt-1 font-display text-2xl font-bold">{orderCount ?? 0}</p>
            <p className="mt-1 text-xs text-ink-on-dark-muted">View history</p>
          </Link>
          <Link
            href="/app/tickets"
            className="rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-5 transition hover:border-amber-glow-400/50"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-on-dark-muted">🎧 Support</p>
            <p className="mt-1 font-display text-lg font-semibold">Open a ticket</p>
            <p className="mt-1 text-xs text-ink-on-dark-muted">We reply fast</p>
          </Link>
        </div>

        {/* New order */}
        <div className="rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-5 sm:p-7">
          <h2 className="mb-5 font-display text-xl font-bold">New order</h2>
          <NewOrderForm categories={categories ?? []} />
        </div>

        {/* Recent orders */}
        {(recent ?? []).length > 0 && (
          <div className="mt-6 rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-bold">Recent orders</h2>
              <Link href="/app/orders" className="text-xs font-semibold text-teal-pop-300 hover:underline">
                View all →
              </Link>
            </div>
            <ul className="divide-y divide-charcoal-800">
              {(recent ?? []).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="max-w-[55%] truncate">
                    {(o.services as { name?: string } | null)?.name ?? "Service"} · {o.quantity.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-3 text-xs text-ink-on-dark-muted">
                    {new Date(o.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                    <span
                      className={`rounded-full px-2.5 py-1 font-semibold capitalize ${
                        o.status === "completed"
                          ? "bg-teal-pop-500/15 text-teal-pop-300"
                          : o.status === "processing" || o.status === "pending" || o.status === "partial"
                            ? "bg-amber-glow-400/15 text-amber-glow-400"
                            : "bg-red-500/15 text-red-300"
                      }`}
                    >
                      {o.status}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
