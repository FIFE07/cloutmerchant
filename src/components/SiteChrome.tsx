import Link from "next/link";
import { Logo } from "@/components/Logo";

/**
 * Public site header. The full services mega-menu lands in Week 3;
 * for now Services links straight to the catalogue.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-muted md:flex">
          <Link href="/services" className="transition hover:text-ink">
            Services
          </Link>
          <Link href="/services#pricing" className="transition hover:text-ink">
            Pricing
          </Link>
          <Link href="/faq" className="transition hover:text-ink">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-ink-muted transition hover:text-ink sm:block"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-amber-glow-400 px-4 py-2 text-sm font-semibold text-charcoal-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-glow-300"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-charcoal-900 text-ink-on-dark">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-on-dark-muted">
            One wallet for social-media growth services. Honest pricing,
            honest delivery estimates, real order tracking.
          </p>
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-on-dark-muted">
            Product
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/services" className="transition hover:text-amber-glow-300">Service catalogue</Link></li>
            <li><Link href="/signup" className="transition hover:text-amber-glow-300">Create account</Link></li>
            <li><Link href="/faq" className="transition hover:text-amber-glow-300">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-on-dark-muted">
            Legal
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/terms" className="transition hover:text-amber-glow-300">Terms of Service</Link></li>
            <li><Link href="/privacy" className="transition hover:text-amber-glow-300">Privacy Policy</Link></li>
            <li><Link href="/refunds" className="transition hover:text-amber-glow-300">Refund Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-charcoal-700">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-ink-on-dark-muted sm:px-6">
          © {new Date().getFullYear()} CLOUTMERCHANT. Delivery times are estimates;
          engagement services may conflict with third-party platform terms — see our Terms.
        </p>
      </div>
    </footer>
  );
}
