import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PanelNav } from "@/components/PanelNav";
import { AddFundsForm } from "@/components/AddFundsForm";
import { formatNairaFromKobo } from "@/lib/format";

/** Add funds — balance, payment form, funding history. */
export default async function FundsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/funds");

  const [{ data: profile }, { data: topups }] = await Promise.all([
    supabase.from("profiles").select("wallet_balance_kobo").eq("id", user.id).single(),
    supabase
      .from("transactions")
      .select("id, amount_kobo, source, created_at")
      .eq("user_id", user.id)
      .eq("type", "credit")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const balance = profile?.wallet_balance_kobo ?? 0;
  const paymentsOn = !!process.env.PAYSTACK_SECRET_KEY;

  return (
    <div className="min-h-screen bg-charcoal-950 text-ink-on-dark">
      <PanelNav balanceKobo={balance} active="/app/funds" />
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-5">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-on-dark-muted">
                Current balance
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-amber-glow-400">
                {formatNairaFromKobo(balance)}
              </p>
              <h1 className="mb-5 mt-6 font-display text-xl font-bold">Add funds</h1>
              <AddFundsForm paymentsOn={paymentsOn} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-5">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-on-dark-muted">
                Recent top-ups
              </h2>
              <ul className="mt-4 space-y-3">
                {(topups ?? []).map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between border-b border-charcoal-800 pb-3 text-sm last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-teal-pop-300">
                        +{formatNairaFromKobo(t.amount_kobo)}
                      </p>
                      <p className="text-xs text-ink-on-dark-muted">
                        {new Date(t.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-charcoal-800 px-2.5 py-1 text-xs capitalize text-ink-on-dark-muted">
                      {t.source}
                    </span>
                  </li>
                ))}
                {(topups ?? []).length === 0 && (
                  <li className="py-6 text-center text-sm text-ink-on-dark-muted">
                    No top-ups yet.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
