"use client";

import { useState } from "react";
import { formatNairaFromKobo } from "@/lib/format";

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

const METHODS = [
  {
    id: "paystack",
    name: "Card / Bank / USSD",
    note: "Paystack · Nigeria & Africa · instant",
    icon: "💳",
    available: true,
  },
  {
    id: "stripe",
    name: "International card",
    note: "Stripe · UK / EU / worldwide",
    icon: "🌍",
    available: false,
  },
  {
    id: "crypto",
    name: "Crypto",
    note: "USDT / BTC",
    icon: "₿",
    available: false,
  },
] as const;

/** Owlet-classic Add Funds: payment method picker + quick amounts + live total. */
export function AddFundsForm({ paymentsOn }: { paymentsOn: boolean }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string>("paystack");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const naira = parseFloat(amount);
  const valid = Number.isFinite(naira) && naira >= 100;
  const selected = METHODS.find((m) => m.id === method)!;

  async function pay() {
    if (!valid || busy) return;
    if (!selected.available) {
      setError(`${selected.name} is coming soon — use Card / Bank / USSD for now.`);
      return;
    }
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
    <div className="space-y-5">
      {/* Payment method */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-on-dark-muted">
          Payment method
        </label>
        <div className="grid gap-2 sm:grid-cols-3">
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`relative rounded-lg border p-3.5 text-left transition ${
                method === m.id
                  ? "border-amber-glow-400 bg-amber-glow-400/10"
                  : "border-charcoal-700 bg-charcoal-800 hover:bg-charcoal-700"
              }`}
            >
              {!m.available && (
                <span className="absolute right-2 top-2 rounded-full bg-charcoal-700 px-2 py-0.5 text-[10px] font-semibold uppercase text-ink-on-dark-muted">
                  soon
                </span>
              )}
              <span className="text-lg">{m.icon}</span>
              <p className={`mt-1.5 font-display text-sm font-semibold ${method === m.id ? "text-amber-glow-400" : "text-ink-on-dark"}`}>
                {m.name}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-ink-on-dark-muted">{m.note}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
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
                  : "border-charcoal-700 bg-charcoal-800 text-ink-on-dark hover:bg-charcoal-700"
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

      {/* Live total */}
      <div className="flex items-center justify-between rounded-lg border border-amber-glow-400/30 bg-amber-glow-400/10 px-4 py-3.5">
        <span className="text-sm text-ink-on-dark">You pay</span>
        <span className="font-display text-2xl font-bold text-amber-glow-400">
          {valid ? `₦${naira.toLocaleString()}` : "₦0"}
        </span>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-300">{error}</p>
      )}

      <button
        onClick={pay}
        disabled={!valid || busy}
        className="w-full rounded-lg bg-amber-glow-400 py-3.5 font-display text-sm font-bold text-charcoal-950 transition hover:bg-amber-glow-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Connecting…" : paymentsOn ? `Pay ₦${valid ? naira.toLocaleString() : ""} securely` : "Add funds"}
      </button>

      <div className="flex items-center justify-center gap-4 text-[11px] text-ink-on-dark-muted">
        <span>🔒 Secured by Paystack</span>
        <span>⚡ Balance updates in seconds</span>
        <span>🧾 Receipt by email</span>
      </div>
    </div>
  );
}

export function formatKobo(k: number) {
  return formatNairaFromKobo(k);
}
