"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatNairaFromKobo } from "@/lib/format";

export type CatalogueService = {
  id: string;
  name: string;
  description: string;
  price_per_1000_kobo: number;
  min_qty: number;
  max_qty: number;
  avg_time: string;
  refill: boolean;
  category_slug: string;
  category_name: string;
};

export function CatalogueTable({
  services,
  platforms,
  initialPlatform = "all",
  initialQuery = "",
}: {
  services: CatalogueService[];
  platforms: { slug: string; name: string }[];
  initialPlatform?: string;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [platform, setPlatform] = useState<string>(initialPlatform);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter(
      (s) =>
        (platform === "all" || s.category_slug === platform) &&
        (!q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)),
    );
  }, [services, query, platform]);

  return (
    <div id="pricing">
      {/* Search + platform chips (mirror the nav grouping, spec §14) */}
      <div className="flex flex-col gap-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search services — e.g. followers, views, tiktok…"
          className="w-full rounded-xl border border-cream-200 bg-surface-raised px-4 py-3 text-ink shadow-sm outline-none placeholder:text-ink-muted/60 focus:border-amber-glow-400"
        />
        <div className="flex flex-wrap gap-2">
          {[{ slug: "all", name: "All platforms" }, ...platforms].map((p) => (
            <button
              key={p.slug}
              onClick={() => setPlatform(p.slug)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                platform === p.slug
                  ? "bg-charcoal-900 text-amber-glow-400"
                  : "bg-cream-100 text-ink-muted hover:bg-cream-200"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-ink-muted">
        {filtered.length} service{filtered.length === 1 ? "" : "s"}
      </p>

      {/* Cards on mobile, table on desktop — nothing clipped at 360px */}
      <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-cream-200 bg-surface-raised shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-cream-200 text-xs uppercase tracking-wider text-ink-muted">
              <th className="px-5 py-3.5 font-medium">Service</th>
              <th className="px-5 py-3.5 font-medium">Platform</th>
              <th className="px-5 py-3.5 font-medium">Price / 1000</th>
              <th className="px-5 py-3.5 font-medium">Min – Max</th>
              <th className="px-5 py-3.5 font-medium">Avg. time</th>
              <th className="px-5 py-3.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-cream-100 last:border-0 hover:bg-cream-50">
                <td className="px-5 py-4">
                  <div className="font-medium text-ink">
                    {s.name}
                    {s.refill && (
                      <span className="ml-2 rounded-full bg-teal-pop-300/20 px-2 py-0.5 text-xs font-medium text-teal-pop-600">
                        refill
                      </span>
                    )}
                  </div>
                  <div className="mt-1 max-w-md text-xs leading-relaxed text-ink-muted">
                    {s.description}
                  </div>
                </td>
                <td className="px-5 py-4 text-ink-muted">{s.category_name}</td>
                <td className="px-5 py-4 font-display font-semibold text-ink">
                  {formatNairaFromKobo(s.price_per_1000_kobo)}
                </td>
                <td className="px-5 py-4 text-ink-muted">
                  {s.min_qty.toLocaleString()} – {s.max_qty.toLocaleString()}
                </td>
                <td className="px-5 py-4 text-ink-muted">{s.avg_time}</td>
                <td className="px-5 py-4">
                  <Link
                    href="/signup"
                    className="rounded-lg bg-amber-glow-400 px-3.5 py-2 text-xs font-semibold text-charcoal-900 transition hover:bg-amber-glow-300"
                  >
                    Order
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-ink-muted">
                  Nothing matches that search. Try a simpler word like “followers”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
