import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PanelNav } from "@/components/PanelNav";
import { formatNairaFromKobo } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-glow-400/15 text-amber-glow-400",
  processing: "bg-teal-pop-500/15 text-teal-pop-300",
  partial: "bg-amber-glow-400/15 text-amber-glow-400",
  completed: "bg-teal-pop-500/15 text-teal-pop-300",
  cancelled: "bg-red-500/15 text-red-300",
  refunded: "bg-red-500/15 text-red-300",
};

const FILTERS = ["all", "pending", "processing", "completed", "refunded"] as const;

/** Orders history — classic dense table with status filter tabs. */
export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/orders");

  let query = supabase
    .from("orders")
    .select("id, link, quantity, charge_kobo, status, created_at, services(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all") query = query.eq("status", status);

  const [{ data: profile }, { data: orders }, { data: allStatuses }] = await Promise.all([
    supabase.from("profiles").select("wallet_balance_kobo").eq("id", user.id).single(),
    query,
    supabase.from("orders").select("status").eq("user_id", user.id).limit(500),
  ]);

  // Count per status for the filter tabs
  const counts: Record<string, number> = { all: allStatuses?.length ?? 0 };
  for (const o of allStatuses ?? []) counts[o.status] = (counts[o.status] ?? 0) + 1;

  return (
    <div className="min-h-screen bg-charcoal-950 text-ink-on-dark">
      <PanelNav balanceKobo={profile?.wallet_balance_kobo ?? 0} active="/app/orders" />
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl font-bold">Orders</h1>
          <Link
            href="/app"
            className="rounded-lg bg-amber-glow-400 px-4 py-2 font-display text-sm font-bold text-charcoal-950 hover:bg-amber-glow-300"
          >
            + New order
          </Link>
        </div>

        {/* Status filter tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const n = counts[f] ?? 0;
            const activeTab = status === f;
            return (
              <Link
                key={f}
                href={f === "all" ? "/app/orders" : `/app/orders?status=${f}`}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                  activeTab
                    ? "border-amber-glow-400 bg-amber-glow-400/15 text-amber-glow-400"
                    : "border-charcoal-700 bg-charcoal-900 text-ink-on-dark-muted hover:border-charcoal-700 hover:text-ink-on-dark"
                }`}
              >
                {f} <span className="opacity-60">({n})</span>
              </Link>
            );
          })}
        </div>

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
                <tr key={o.id} className="border-b border-charcoal-800 last:border-0 hover:bg-charcoal-800/50">
                  <td className="px-4 py-3 font-mono text-xs">{String(o.id).slice(0, 8)}</td>
                  <td className="max-w-[280px] truncate px-4 py-3">
                    {(o.services as { name?: string } | null)?.name ?? "—"}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-ink-on-dark-muted">
                    <a href={o.link} target="_blank" rel="noreferrer" className="hover:text-teal-pop-300 hover:underline">
                      {o.link.replace(/^https?:\/\//, "")}
                    </a>
                  </td>
                  <td className="px-4 py-3">{o.quantity.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-amber-glow-400">{formatNairaFromKobo(o.charge_kobo)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[o.status] ?? ""}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-on-dark-muted">
                    {new Date(o.created_at).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    ·{" "}
                    {new Date(o.created_at).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
              {(orders ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <p className="text-ink-on-dark-muted">
                      {status === "all" ? "No orders yet." : `No ${status} orders.`}
                    </p>
                    <Link
                      href="/app"
                      className="mt-3 inline-block rounded-lg bg-amber-glow-400 px-5 py-2.5 font-display text-sm font-bold text-charcoal-950 hover:bg-amber-glow-300"
                    >
                      Place your first order →
                    </Link>
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
