import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PanelNav } from "@/components/PanelNav";
import { RegenerateKeyButton } from "@/components/RegenerateKeyButton";

/** Reseller API page — key, examples, regenerate. */
export default async function ApiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/api");

  const { data: profile } = await supabase
    .from("profiles")
    .select("wallet_balance_kobo, api_key")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-charcoal-950 text-ink-on-dark">
      <PanelNav balanceKobo={profile?.wallet_balance_kobo ?? 0} active="/app/api" />
      <main className="mx-auto max-w-3xl px-3 py-10 sm:px-5">
        <div className="rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900 p-7">
          <h1 className="font-display text-xl font-bold">Reseller API</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-on-dark-muted">
            Connect your own website or panel to CLOUTMERCHANT and place orders automatically
            at reseller prices (10% cheaper than listed).
          </p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-on-dark-muted">
            Your API key
          </p>
          <p className="mt-1 break-all rounded-lg bg-charcoal-800 px-4 py-3 font-mono text-sm text-amber-glow-400">
            {profile?.api_key ?? "No key yet — click Regenerate to create one"}
          </p>
          <RegenerateKeyButton />

          <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-on-dark-muted">
            Example: place an order
          </p>
          <pre className="mt-1 overflow-x-auto rounded-lg bg-charcoal-800 p-4 text-xs leading-relaxed text-ink-on-dark-muted">
{`POST /api/order
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "serviceId": "<service UUID from /services>",
  "link": "https://instagram.com/p/...",
  "quantity": 1000
}`}
          </pre>
          <p className="mt-3 text-xs text-ink-on-dark-muted">
            Service IDs and prices: see the <span className="text-amber-glow-400">Services</span> page.
            Orders charge your wallet balance instantly and fulfil automatically.
          </p>
        </div>
      </main>
    </div>
  );
}
