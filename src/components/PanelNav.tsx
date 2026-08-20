import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";
import { formatNairaFromKobo } from "@/lib/format";

const LINKS = [
  { href: "/app", label: "New order" },
  { href: "/services", label: "Services" },
  { href: "/app/orders", label: "Orders" },
  { href: "/app/funds", label: "Add funds" },
  { href: "/app/api", label: "API" },
  { href: "/app/tickets", label: "Tickets" },
];

/**
 * Classic panel top navigation — dark bar, page links left,
 * balance pill + account right (Owlet-classic structure, CLOUTMERCHANT skin).
 */
export function PanelNav({
  balanceKobo,
  active,
}: {
  balanceKobo: number;
  active: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-charcoal-700 bg-charcoal-900 text-ink-on-dark">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-1 px-3 sm:px-5">
        <Link href="/app" className="mr-3 shrink-0">
          <Logo />
        </Link>
        <nav className="hidden flex-1 items-center gap-1 overflow-x-auto md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition ${
                active === l.href
                  ? "bg-amber-glow-400 text-charcoal-950"
                  : "text-ink-on-dark-muted hover:bg-charcoal-800 hover:text-ink-on-dark"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="rounded-full bg-amber-glow-400/15 px-3 py-1 font-display text-sm font-semibold text-amber-glow-400 ring-1 ring-amber-glow-400/40">
            {formatNairaFromKobo(balanceKobo)}
          </span>
          <SignOutButton />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-charcoal-800 px-3 py-2 md:hidden">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ${
              active === l.href
                ? "bg-amber-glow-400 text-charcoal-950"
                : "text-ink-on-dark-muted"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
