import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PanelNav } from "@/components/PanelNav";

/** Support tickets — full ticket threading lands in the next build phase. */
export default async function TicketsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/tickets");

  const { data: profile } = await supabase
    .from("profiles")
    .select("wallet_balance_kobo")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-charcoal-950 text-ink-on-dark">
      <PanelNav balanceKobo={profile?.wallet_balance_kobo ?? 0} active="/app/tickets" />
      <main className="mx-auto max-w-2xl px-3 py-10 sm:px-5">
        <div className="rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-7 text-center">
          <h1 className="font-display text-xl font-bold">Support tickets</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-on-dark-muted">
            The ticket desk opens in the next build phase. Until then, every order page shows
            live status, and failed orders are refunded to your balance automatically.
          </p>
        </div>
      </main>
    </div>
  );
}
