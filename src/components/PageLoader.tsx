/** Branded loading screen shown instantly while a page's data loads. */
export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-charcoal-950">
      <div className="flex flex-col items-center gap-5">
        {/* Amber spinner ring around a pulsing dot */}
        <div className="relative grid size-16 place-items-center">
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-charcoal-700 border-t-amber-glow-400" />
          <span className="size-3 animate-ping rounded-full bg-amber-glow-400" />
        </div>
        <p className="font-display text-sm font-semibold tracking-widest text-ink-on-dark-muted uppercase">
          {label}
          <span className="animate-pulse">…</span>
        </p>
      </div>
    </div>
  );
}
