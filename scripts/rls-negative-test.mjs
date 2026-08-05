// Sentinel RLS negative test: an anonymous client (anon key, no session)
// must NOT see orders, transactions, profiles, tickets, notifications, audit_log.
// It SHOULD see the active public catalogue. Run: node scripts/rls-negative-test.mjs
import { createClient } from "@supabase/supabase-js";
import { config } from "node:process";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(url, anon); // no auth session = anonymous

const mustBeEmpty = ["orders", "transactions", "profiles", "tickets", "ticket_messages", "notifications", "audit_log"];
const mustBeReadable = ["services", "service_categories", "announcements"];

let failed = false;

for (const table of mustBeEmpty) {
  const { data, error } = await supabase.from(table).select("*");
  const visible = data?.length ?? 0;
  const ok = visible === 0;
  if (!ok) failed = true;
  console.log(`${ok ? "PASS" : "FAIL"}  anon read ${table}: ${visible} rows visible (expected 0)${error ? ` [${error.code}]` : ""}`);
}

for (const table of mustBeReadable) {
  const { data, error } = await supabase.from(table).select("*");
  const visible = data?.length ?? 0;
  const ok = !error && visible >= 0; // catalogue must not error for anon
  if (error) failed = true;
  console.log(`${ok ? "PASS" : "FAIL"}  anon read ${table}: ${visible} rows visible${error ? ` [${error.message}]` : ""}`);
}

// Wallet functions must be un-callable by anon
const { error: creditErr } = await supabase.rpc("credit_wallet", {
  p_user_id: "00000000-0000-0000-0000-000000000000",
  p_amount_kobo: 100,
  p_reference: "test",
  p_source: "bonus",
});
const blocked = !!creditErr;
if (!blocked) failed = true;
console.log(`${blocked ? "PASS" : "FAIL"}  anon call credit_wallet: blocked (${creditErr?.message ?? "NO ERROR — CRITICAL"})`);

process.exit(failed ? 1 : 0);
