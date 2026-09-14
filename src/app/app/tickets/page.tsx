import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PanelNav } from "@/components/PanelNav";
import { NewTicketForm } from "@/components/NewTicketForm";

const STATUS_STYLE: Record<string, string> = {
  open: "bg-amber-glow-400/15 text-amber-glow-400",
  answered: "bg-teal-pop-500/15 text-teal-pop-300",
  closed: "bg-charcoal-700 text-ink-on-dark-muted",
};

/** Tickets — list own threads + open a new one. */
export default async function TicketsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/tickets");

  const [{ data: profile }, { data: tickets }] = await Promise.all([
    supabase.from("profiles").select("wallet_balance_kobo").eq("id", user.id).single(),
    supabase
      .from("tickets")
      .select("id, subject, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="min-h-screen bg-charcoal-950 text-ink-on-dark">
      <PanelNav balanceKobo={profile?.wallet_balance_kobo ?? 0} active="/app/tickets" />
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-5">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-5 sm:p-7">
              <h1 className="mb-5 font-display text-xl font-bold">Open a ticket</h1>
              <NewTicketForm />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-5">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-on-dark-muted">
                Your tickets
              </h2>
              <ul className="mt-4 space-y-3">
                {(tickets ?? []).map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 border-b border-charcoal-800 pb-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.subject}</p>
                      <p className="text-xs text-ink-on-dark-muted">
                        {new Date(t.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[t.status] ?? ""}`}
                    >
                      {t.status}
                    </span>
                  </li>
                ))}
                {(tickets ?? []).length === 0 && (
                  <li className="py-6 text-center text-sm text-ink-on-dark-muted">
                    No tickets yet — we usually reply within a few hours.
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
