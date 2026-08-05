import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-2 text-sm text-ink-muted">Last updated: {updated}</p>
        <div className="prose-neutral mt-8 space-y-6 text-[15px] leading-relaxed text-ink-muted [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function legalMetadata(title: string, description: string): Metadata {
  return { title, description };
}
