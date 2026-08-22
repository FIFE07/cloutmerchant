"use client";

import { useEffect, useMemo, useState } from "react";
import { formatNairaFromKobo } from "@/lib/format";

type Category = { id: string; name: string; slug: string };
type Service = {
  id: string;
  provider_service_id: string;
  name: string;
  description: string;
  subcategory: string;
  tier: "free" | "budget" | "standard" | "premium";
  price_per_1000_kobo: number;
  min_qty: number;
  max_qty: number;
  refill: boolean;
};

const TIER_BADGE: Record<Service["tier"], string> = {
  free: "🎁",
  budget: "💰",
  standard: "⭐",
  premium: "👑",
};

const TIER_EXPLAINER: Record<Service["tier"], string> = {
  free: "🎁 Free — costs nothing. Good for testing how delivery works.",
  budget:
    "💰 Budget — the cheapest option in this group. Great for big numbers on a tight budget. Drops can happen, so avoid it for accounts you can't afford to lose numbers on.",
  standard:
    "⭐ Standard — balanced quality and price. The safe everyday choice for most orders.",
  premium:
    "👑 Premium — the highest quality in this group: real-looking profiles, slowest delivery, lowest drop. Best for business pages and important accounts.",
};

/**
 * Classic panel "New Order" form with a 3-level dropdown chain:
 *   Category → Sub-category → Service → Link → Quantity → live charge.
 */
export function NewOrderForm({ categories }: { categories: Category[] }) {
  const [categoryId, setCategoryId] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [subcategory, setSubcategory] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [search, setSearch] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loadingServices, setLoadingServices] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setServices([]);
      return;
    }
    setLoadingServices(true);
    setSubcategory("");
    setServiceId("");
    fetch(`/api/catalogue?category=${encodeURIComponent(categoryId)}`)
      .then((r) => r.json())
      .then((d) => setServices(d.services ?? []))
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }, [categoryId]);

  const subcategories = useMemo(
    () => [...new Set(services.map((s) => s.subcategory))].sort(),
    [services],
  );

  const visibleServices = useMemo(() => {
    let list = services;
    if (subcategory) list = list.filter((s) => s.subcategory === subcategory);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.provider_service_id.includes(q),
      );
    }
    return list;
  }, [services, subcategory, search]);

  const service = services.find((s) => s.id === serviceId) ?? null;
  const qty = parseInt(quantity, 10);
  const charge =
    service && Number.isFinite(qty) && qty > 0
      ? Math.ceil((qty * service.price_per_1000_kobo) / 1000)
      : 0;
  const qtyError =
    service && Number.isFinite(qty) && (qty < service.min_qty || qty > service.max_qty)
      ? `Quantity must be between ${service.min_qty.toLocaleString()} and ${service.max_qty.toLocaleString()}`
      : null;

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!service || !link || !qty || qtyError) return;
    setPlacing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, link, quantity: qty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "order_failed");
      setMessage({
        ok: true,
        text: `Order #${data.shortId} placed — ${formatNairaFromKobo(data.chargeKobo)} charged. Track it under Orders.`,
      });
      setLink("");
      setQuantity("");
    } catch (err) {
      setMessage({
        ok: false,
        text:
          err instanceof Error && err.message === "insufficient_funds"
            ? "Not enough balance — please add funds first."
            : "Could not place the order. You have NOT been charged. Please try again.",
      });
    } finally {
      setPlacing(false);
    }
  }

  const input =
    "w-full rounded-lg border border-charcoal-700 bg-charcoal-800 px-3 py-2.5 text-sm text-ink-on-dark placeholder:text-ink-on-dark-muted/60 focus:border-amber-glow-400 focus:outline-none";
  const label =
    "mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-on-dark-muted";

  return (
    <form onSubmit={placeOrder} className="space-y-4">
      {/* Step 1 — Category */}
      <div>
        <label className={label}>1 · Category</label>
        <select
          className={input}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">— Choose a category —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Step 2 — Sub-category */}
      <div>
        <label className={label}>2 · Sub-category</label>
        <select
          className={input}
          value={subcategory}
          onChange={(e) => {
            setSubcategory(e.target.value);
            setServiceId("");
          }}
          disabled={!categoryId || loadingServices}
          required
        >
          <option value="">
            {loadingServices
              ? "Loading…"
              : !categoryId
                ? "Pick a category first"
                : "— Choose a sub-category —"}
          </option>
          {subcategories.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Step 3 — Service (with optional search) */}
      <div>
        <label className={label}>3 · Service</label>
        {subcategory && visibleServices.length > 25 && (
          <input
            className={`${input} mb-2`}
            placeholder="Type to narrow the list…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
        <select
          className={input}
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          disabled={!subcategory}
          required
        >
          <option value="">
            {!subcategory
              ? "Pick a sub-category first"
              : `— Choose a service (${visibleServices.length}) —`}
          </option>
          {visibleServices.map((s) => (
            <option key={s.id} value={s.id}>
              {TIER_BADGE[s.tier]} {s.provider_service_id} — {s.name} — {formatNairaFromKobo(s.price_per_1000_kobo)}/1000
            </option>
          ))}
        </select>
      </div>

      {service && (
        <div className="rounded-lg border border-charcoal-700 bg-charcoal-800/60 p-3 text-xs leading-relaxed text-ink-on-dark-muted">
          <p className="mb-1 font-semibold text-ink-on-dark">{TIER_EXPLAINER[service.tier]}</p>
          <p>{service.description || "No extra description for this service."}</p>
          <p className="mt-2">
            Min {service.min_qty.toLocaleString()} · Max {service.max_qty.toLocaleString()} ·{" "}
            {service.refill ? "✓ Refill protected (if numbers drop, they are topped back up)" : "No refill (if numbers drop, they are not replaced)"} ·{" "}
            <span className="text-amber-glow-400">
              {formatNairaFromKobo(service.price_per_1000_kobo)} per 1000
            </span>
          </p>
        </div>
      )}

      <div>
        <label className={label}>4 · Link</label>
        <input
          className={input}
          type="url"
          placeholder="https://…"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          required
        />
      </div>

      <div>
        <label className={label}>5 · Quantity</label>
        <input
          className={input}
          type="number"
          min={service?.min_qty}
          max={service?.max_qty}
          placeholder={service ? `${service.min_qty} – ${service.max_qty}` : "Quantity"}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        {qtyError && <p className="mt-1 text-xs text-red-400">{qtyError}</p>}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-charcoal-800 px-4 py-3">
        <span className="text-sm text-ink-on-dark-muted">Charge</span>
        <span className="font-display text-xl font-bold text-amber-glow-400">
          {formatNairaFromKobo(charge)}
        </span>
      </div>

      {message && (
        <p
          className={`rounded-lg px-4 py-3 text-sm ${
            message.ok
              ? "bg-teal-pop-500/15 text-teal-pop-300"
              : "bg-red-500/15 text-red-300"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={placing || !service || !link || !qty || !!qtyError}
        className="w-full rounded-lg bg-amber-glow-400 py-3 font-display text-sm font-bold text-charcoal-950 transition hover:bg-amber-glow-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {placing ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}
