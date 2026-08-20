import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PanelNav } from "@/components/PanelNav";

/** Reseller API page — shows the customer's key and example calls. */
export default async function ApiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/api");

  const [{ data: profile }] = await Promise.all([
    supabase.from("profiles").select("wallet_balance_kobo, api_key").eq("id", user.id).single(),
  ]);

  return (
    <div className="min-h-screen bg-charcoal-950 text-ink-on-dark">
      <PanelNav balanceKobo={profile?.wallet_balance_kobo ?? 0} active="/app/api" />
      <main className="mx-auto max-w-2xl px-3 py-10 sm:px-5">
        <div className="rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-7">
          <h1 className="font-display text-xl font-bold">Reseller API</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-on-dark-muted">
            Connect your own panel or website to CLOUTMERCHANT and order automatically at
            reseller prices. The public API endpoint opens in the next build phase — your
            personal key is ready below.
          </p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-on-dark-muted">Your API key</p>
          <p className="mt-1 break-all rounded-lg bg-charcoal-800 px-4 py-3 font-mono text-sm text-amber-glow-400">
            {profile?.api_key ?? "Generated on first use"}
          </p>
        </div>
      </main>
    </div>
  );
}
