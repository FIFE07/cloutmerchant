import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PanelNav } from "@/components/PanelNav";
import { formatNairaFromKobo } from "@/lib/format";

/** Add funds — Paystack card/bank-transfer charging lands in the next phase. */
export default async function FundsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/funds");

  const { data: profile } = await supabase
    .from("profiles")
    .select("wallet_balance_kobo")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-charcoal-950 text-ink-on-dark">
      <PanelNav balanceKobo={profile?.wallet_balance_kobo ?? 0} active="/app/funds" />
      <main className="mx-auto max-w-2xl px-3 py-10 sm:px-5">
        <div className="rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-7 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-on-dark-muted">Current balance</p>
          <p className="mt-1 font-display text-3xl font-bold text-amber-glow-400">
            {formatNairaFromKobo(profile?.wallet_balance_kobo ?? 0)}
          </p>
          <h1 className="mt-6 font-display text-xl font-bold">Card &amp; bank transfer funding is being connected</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-on-dark-muted">
            Automatic top-ups (Paystack — card, bank transfer, USSD) are in the final setup
            stage. Once live, money you add here appears in your balance within seconds.
          </p>
        </div>
      </main>
    </div>
  );
}
