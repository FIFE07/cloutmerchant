/** Money is stored as integer kobo everywhere. These helpers are display-only. */
export function formatNairaFromKobo(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-NG").format(n);
}
