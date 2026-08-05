"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatNairaFromKobo } from "@/lib/format";

export type MegaMenuItem = {
  label: string; // e.g. "Followers"
  description: string;
  fromPriceKobo: number | null;
  href: string;
};

export type MegaMenuColumn = {
  name: string; // e.g. "Instagram"
  slug: string;
  items: MegaMenuItem[];
};

/**
 * Services mega-menu (spec §14): full-width panel, one column per platform,
 * hover reveals a one-line description + starting price, keyboard-navigable,
 * closes on Escape and outside click.
 */
export function ServicesMegaMenu({ columns }: { columns: MegaMenuColumn[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        className={`flex items-center gap-1.5 text-sm font-medium transition ${
          open ? "text-ink" : "text-ink-muted hover:text-ink"
        }`}
      >
        Services
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-x-0 top-16 z-50 border-b border-cream-200 bg-cream-50 shadow-xl">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 xl:grid-cols-6">
            {columns.map((col) => (
              <div key={col.slug}>
                <Link
                  href={`/services?platform=${col.slug}`}
                  onClick={() => setOpen(false)}
                  className="font-display text-sm font-semibold text-ink hover:text-amber-glow-600"
                >
                  {col.name}
                </Link>
                <ul className="mt-3 space-y-1">
                  {col.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="group block rounded-lg px-2 py-1.5 -mx-2 transition hover:bg-cream-100"
                      >
                        <span className="block text-sm text-ink-muted group-hover:text-ink">
                          {item.label}
                        </span>
                        <span className="mt-0.5 hidden text-xs leading-snug text-ink-muted/70 group-hover:block">
                          {item.description}
                          {item.fromPriceKobo !== null &&
                            ` · from ${formatNairaFromKobo(item.fromPriceKobo)}/1000`}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/services?platform=${col.slug}`}
                  onClick={() => setOpen(false)}
                  className="mt-3 inline-block text-xs font-medium text-teal-pop-600 hover:underline"
                >
                  View all {col.name} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Mobile navigation drawer (spec §14): hamburger opens a panel where each
 * platform is an accordion row. A visible close button AND tapping the
 * backdrop both dismiss it — nobody gets trapped.
 */
export function MobileNav({ columns }: { columns: MegaMenuColumn[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid size-10 place-items-center rounded-xl border border-cream-200 text-ink"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop — tap anywhere here to close */}
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-charcoal-950/50"
          />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-cream-50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cream-200 px-5 py-4">
              <span className="font-display text-base font-bold text-ink">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="grid size-10 place-items-center rounded-xl border border-cream-200 text-ink"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-4">
              <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Services by platform
              </p>
              {columns.map((col) => (
                <div key={col.slug} className="border-b border-cream-100">
                  <button
                    type="button"
                    aria-expanded={expanded === col.slug}
                    onClick={() => setExpanded((e) => (e === col.slug ? null : col.slug))}
                    className="flex w-full items-center justify-between py-3.5 text-left font-medium text-ink"
                  >
                    {col.name}
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                      className={`transition-transform ${expanded === col.slug ? "rotate-180" : ""}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {expanded === col.slug && (
                    <ul className="pb-3 pl-3">
                      {col.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="block py-2 text-sm text-ink-muted"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href={`/services?platform=${col.slug}`}
                          onClick={() => setOpen(false)}
                          className="block py-2 text-sm font-medium text-teal-pop-600"
                        >
                          View all {col.name} →
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              ))}

              <div className="mt-4 space-y-1">
                <Link href="/faq" onClick={() => setOpen(false)} className="block py-3 font-medium text-ink">
                  FAQ
                </Link>
                <Link href="/login" onClick={() => setOpen(false)} className="block py-3 font-medium text-ink">
                  Log in
                </Link>
              </div>
            </nav>

            <div className="border-t border-cream-200 p-5">
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="block rounded-xl bg-amber-glow-400 py-3.5 text-center font-display font-semibold text-charcoal-900"
              >
                Get started free
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
