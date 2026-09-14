"use client";

import { useState } from "react";
import { formatNairaFromKobo } from "@/lib/format";

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

/** Owlet-classic Add Funds: quick amounts + custom amount + pay button. */
export function AddFundsForm({ paymentsOn }: { paymentsOn: boolean }) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const naira = parseFloat(amount);
  const valid = Number.isFinite(naira) && naira >= 100;

  async function pay() {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountNaira: naira }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError("Online payments open very soon. Please check back shortly.");
        return;
      }
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url; // → Paystack secure checkout
    } catch {
      setError("Could not start the payment. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-lg border border-charcoal-700 bg-charcoal-800 px-3 py-2.5 text-sm text-ink-on-dark placeholder:text-ink-on-dark-muted/60 focus:border-amber-glow-400 focus:outline-none";

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-on-dark-muted">
          Amount (NGN)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(String(a))}
              className={`rounded-lg border px-3 py-2.5 font-display text-sm font-semibold transition ${
                parseFloat(amount) === a
                  ? "border-amber-glow-400 bg-amber-glow-400/15 text-amber-glow-400"
                  : "border-charcoal-700 bg-charcoal-800 text-ink-on-dark hover:border-charcoal-700 hover:bg-charcoal-700"
              }`}
            >
              ₦{a.toLocaleString()}
            </button>
          ))}
        </div>
        <input
          className={`${input} mt-3`}
          type="number"
          min={100}
          placeholder="Or type a custom amount (min ₦100)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-charcoal-800 px-4 py-3">
        <span className="text-sm text-ink-on-dark-muted">You pay</span>
        <span className="font-display text-xl font-bold text-amber-glow-400">
          {valid ? `₦${naira.toLocaleString()}` : "₦0"}
        </span>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-300">{error}</p>
      )}

      <button
        onClick={pay}
        disabled={!valid || busy}
        className="w-full rounded-lg bg-amber-glow-400 py-3 font-display text-sm font-bold text-charcoal-950 transition hover:bg-amber-glow-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Connecting…" : paymentsOn ? "Pay with card / bank transfer / USSD" : "Add funds"}
      </button>

      <p className="text-center text-xs text-ink-on-dark-muted">
        Secured by Paystack · money lands in your balance within seconds
      </p>
    </div>
  );
}

export function formatKobo(k: number) {
  return formatNairaFromKobo(k);
}
