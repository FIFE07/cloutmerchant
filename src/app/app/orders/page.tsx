import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PanelNav } from "@/components/PanelNav";
import { formatNairaFromKobo } from "@/lib/format";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-glow-400/15 text-amber-glow-400",
  processing: "bg-teal-pop-500/15 text-teal-pop-300",
  partial: "bg-amber-glow-400/15 text-amber-glow-400",
  completed: "bg-teal-pop-500/15 text-teal-pop-300",
  cancelled: "bg-red-500/15 text-red-300",
  refunded: "bg-red-500/15 text-red-300",
};

/** Orders history — classic dense table. */
export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/orders");

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("wallet_balance_kobo").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("id, link, quantity, charge_kobo, status, created_at, services(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  return (
    <div className="min-h-screen bg-charcoal-950 text-ink-on-dark">
      <PanelNav balanceKobo={profile?.wallet_balance_kobo ?? 0} active="/app/orders" />
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-5">
        <h1 className="mb-5 font-display text-xl font-bold">Orders</h1>
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-charcoal-700 text-left text-xs uppercase tracking-wide text-ink-on-dark-muted">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Link</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Charge</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).map((o) => (
                <tr key={o.id} className="border-b border-charcoal-800 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{String(o.id).slice(0, 8)}</td>
                  <td className="max-w-[280px] truncate px-4 py-3">
                    {(o.services as { name?: string } | null)?.name ?? "—"}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-ink-on-dark-muted">{o.link}</td>
                  <td className="px-4 py-3">{o.quantity.toLocaleString()}</td>
                  <td className="px-4 py-3">{formatNairaFromKobo(o.charge_kobo)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[o.status] ?? ""}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-on-dark-muted">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {(orders ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-ink-on-dark-muted">
                    No orders yet — place your first one from New order.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
