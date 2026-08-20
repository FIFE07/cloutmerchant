import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PanelNav } from "@/components/PanelNav";
import { NewOrderForm } from "@/components/NewOrderForm";
import { formatNairaFromKobo } from "@/lib/format";

/** Panel home — classic layout: navbar, stats row, New Order form. */
export default async function PanelHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app");

  const [{ data: profile }, { count: orderCount }, { data: categories }] = await Promise.all([
    supabase.from("profiles").select("display_name, wallet_balance_kobo").eq("id", user.id).single(),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("service_categories").select("id, name, slug").eq("is_active", true).order("sort_order"),
  ]);

  const balance = profile?.wallet_balance_kobo ?? 0;

  return (
    <div className="min-h-screen bg-charcoal-950 text-ink-on-dark">
      <PanelNav balanceKobo={balance} active="/app" />
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-5">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-on-dark-muted">Balance</p>
            <p className="mt-1 font-display text-2xl font-bold text-amber-glow-400">
              {formatNairaFromKobo(balance)}
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-on-dark-muted">Total orders</p>
            <p className="mt-1 font-display text-2xl font-bold">{orderCount ?? 0}</p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-on-dark-muted">Account</p>
            <p className="mt-1 truncate font-display text-lg font-semibold">
              {profile?.display_name || user.email}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-5 sm:p-7">
          <h1 className="mb-5 font-display text-xl font-bold">New order</h1>
          <NewOrderForm categories={categories ?? []} />
        </div>
      </main>
    </div>
  );
}
