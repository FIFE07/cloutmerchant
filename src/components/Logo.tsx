import Link from "next/link";

/** Small original mark: an upward spark inside a rounded square. */
export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="CLOUTMERCHANT home">
      <span className="grid size-9 place-items-center rounded-xl bg-amber-glow-400">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3l2.2 6.1L21 12l-6.8 2.9L12 21l-2.2-6.1L3 12l6.8-2.9L12 3z"
            fill="#14151a"
          />
        </svg>
      </span>
      <span
        className={`font-display text-lg font-bold tracking-tight ${
          dark ? "text-ink-on-dark" : "text-ink"
        }`}
      >
        CLOUT<span className="text-amber-glow-500">MERCHANT</span>
      </span>
    </Link>
  );
}
