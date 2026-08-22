import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { createClient } from "@/lib/supabase/server";
import { formatNairaFromKobo } from "@/lib/format";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Every CLOUTMERCHANT service with live prices per 1000, min/max quantities and refill availability.",
};

export const revalidate = 300;
const PAGE_SIZE = 50;

/**
 * Services — classic panel table: ID, Service, Rate per 1000, Min, Max,
 * Refill, Description. Category dropdown + search, server-side pagination.
 */
export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const { category = "all", q = "", page = "1" } = await searchParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order");

  const catById = new Map((categories ?? []).map((c) => [c.id, c]));
  const selectedCat = (categories ?? []).find((c) => c.slug === category);

  let query = supabase
    .from("services")
    .select("id, provider_service_id, name, description, subcategory, tier, price_per_1000_kobo, min_qty, max_qty, refill, category_id", { count: "exact" })
    .eq("is_active", true)
    .order("provider_service_id");

  if (selectedCat) query = query.eq("category_id", selectedCat.id);
  if (q.trim()) query = query.or(`name.ilike.%${q.trim()}%,provider_service_id.eq.${q.trim().replace(/[^0-9]/g, "") || "-1"}`);

  const from = (pageNum - 1) * PAGE_SIZE;
  const { data: services, count } = await query.range(from, from + PAGE_SIZE - 1);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const pageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return `/services${s ? `?${s}` : ""}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-charcoal-950 text-ink-on-dark">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-8 sm:px-5">
        <h1 className="font-display text-2xl font-bold">Services</h1>

        {/* Filters — classic: category dropdown + search box */}
        <form method="get" action="/services" className="mt-5 flex flex-col gap-3 sm:flex-row">
          <select
            name="category"
            defaultValue={category}
            className="rounded-lg border border-charcoal-700 bg-charcoal-800 px-3 py-2.5 text-sm text-ink-on-dark focus:border-amber-glow-400 focus:outline-none"
          >
            <option value="all">All categories ({categories?.length ?? 0})</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name or service ID…"
            className="flex-1 rounded-lg border border-charcoal-700 bg-charcoal-800 px-3 py-2.5 text-sm text-ink-on-dark placeholder:text-ink-on-dark-muted/60 focus:border-amber-glow-400 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-amber-glow-400 px-5 py-2.5 font-display text-sm font-bold text-charcoal-950 hover:bg-amber-glow-300"
          >
            Filter
          </button>
        </form>

        <p className="mt-4 text-xs text-ink-on-dark-muted">
          {(count ?? 0).toLocaleString()} services · page {pageNum} of {totalPages}
        </p>

        <div className="mt-3 overflow-x-auto rounded-[var(--radius-card)] border border-charcoal-700 bg-charcoal-900">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-charcoal-700 text-left text-xs uppercase tracking-wide text-ink-on-dark-muted">
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">Service</th>
                <th className="px-3 py-3">Rate per 1000</th>
                <th className="px-3 py-3">Min</th>
                <th className="px-3 py-3">Max</th>
                <th className="px-3 py-3">Refill</th>
                <th className="px-3 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {(services ?? []).map((s) => (
                <tr key={s.id} className="border-b border-charcoal-800 align-top last:border-0 hover:bg-charcoal-800/50">
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-ink-on-dark-muted">
                    {s.provider_service_id}
                  </td>
                  <td className="max-w-[340px] px-3 py-2.5">
                    <span className="mr-1" title={s.tier}>
                      {s.tier === "premium" ? "👑" : s.tier === "budget" ? "💰" : s.tier === "free" ? "🎁" : "⭐"}
                    </span>
                    <span className="mr-2 rounded bg-charcoal-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-teal-pop-300">
                      {s.subcategory}
                    </span>
                    {s.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-amber-glow-400">
                    {formatNairaFromKobo(s.price_per_1000_kobo)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">{s.min_qty.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{s.max_qty.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {s.refill ? (
                      <span className="text-teal-pop-300">✓</span>
                    ) : (
                      <span className="text-ink-on-dark-muted">—</span>
                    )}
                  </td>
                  <td className="max-w-[280px] px-3 py-2.5 text-xs leading-relaxed text-ink-on-dark-muted">
                    {s.description || "—"}
                  </td>
                </tr>
              ))}
              {(services ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-ink-on-dark-muted">
                    No services match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-ink-on-dark-muted">
          Badge guide: 👑 Premium = highest quality, lowest drop · ⭐ Standard = balanced ·
          💰 Budget = cheapest, drops can happen · 🎁 Free · ✓ Refill = dropped numbers are replaced.
        </p>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <Link
            href={pageUrl(Math.max(1, pageNum - 1))}
            aria-disabled={pageNum <= 1}
            className={`rounded-lg border border-charcoal-700 px-4 py-2 text-sm ${pageNum <= 1 ? "pointer-events-none opacity-40" : "hover:bg-charcoal-800"}`}
          >
            ← Previous
          </Link>
          <Link
            href={pageUrl(Math.min(totalPages, pageNum + 1))}
            aria-disabled={pageNum >= totalPages}
            className={`rounded-lg border border-charcoal-700 px-4 py-2 text-sm ${pageNum >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-charcoal-800"}`}
          >
            Next →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
