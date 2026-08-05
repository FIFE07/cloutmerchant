import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { CatalogueTable, type CatalogueService } from "@/components/CatalogueTable";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Service catalogue & pricing",
  description:
    "Browse every CLOUTMERCHANT service with public prices per 1000, min/max quantities, average delivery times and refill availability.",
};

export const revalidate = 60;

export default async function ServicesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order");

  const { data: services } = await supabase
    .from("services")
    .select("id, name, description, price_per_1000_kobo, min_qty, max_qty, avg_time, refill, category_id")
    .eq("is_active", true)
    .order("sort_order");

  const catById = new Map((categories ?? []).map((c) => [c.id, c]));

  const rows: CatalogueService[] = (services ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    price_per_1000_kobo: s.price_per_1000_kobo,
    min_qty: s.min_qty,
    max_qty: s.max_qty,
    avg_time: s.avg_time,
    refill: s.refill,
    category_slug: catById.get(s.category_id)?.slug ?? "",
    category_name: catById.get(s.category_id)?.name ?? "",
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Services & pricing
        </h1>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Every price is public. Ordering needs a free account — your wallet is
          only ever charged after you see and confirm the exact cost.
        </p>
        <div className="mt-8">
          <CatalogueTable
            services={rows}
            platforms={(categories ?? []).map((c) => ({ slug: c.slug, name: c.name }))}
          />
        </div>
        <p className="mt-6 text-xs leading-relaxed text-ink-muted">
          Catalogue is in demo mode while fulfilment providers are connected.
          Prices and delivery estimates will reflect live provider rates at launch.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
