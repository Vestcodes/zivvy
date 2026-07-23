/**
 * Formatting helpers — one shared source of truth for money, dates, and
 * relative time across every screen. Audit #9 in the design pass.
 */

/**
 * Format a monetary amount with the correct currency symbol and locale.
 * Uses Intl.NumberFormat with narrowSymbol (`$` not `US$`, `€` not `EUR`, etc.)
 * and drops fractional digits by default (ERP invoices don't need cents in list views).
 */
export function formatMoney(
  amount: number | string | null | undefined,
  currency: string = "USD",
  opts: { locale?: string; fractionDigits?: number } = {}
): string {
  if (amount === null || amount === undefined || amount === "") return "—";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return "—";
  const { locale, fractionDigits } = opts;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: fractionDigits ?? 0,
      maximumFractionDigits: fractionDigits ?? 0
    }).format(n);
  } catch {
    // Invalid currency code — fall back to plain number.
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: fractionDigits ?? 0,
      maximumFractionDigits: fractionDigits ?? 0
    }).format(n);
  }
}

/** Format the "cents" version — 2 fractional digits. Used on detail pages. */
export function formatMoneyExact(
  amount: number | string | null | undefined,
  currency: string = "USD",
  locale?: string
): string {
  return formatMoney(amount, currency, { fractionDigits: 2, locale });
}

/**
 * Relative time string ("just now", "5 min ago", "3 hr ago", "2 days ago").
 * Everything > 6 days falls back to a formatted date.
 */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return String(iso);
  const diff = Date.now() - then;
  if (diff < 0) return formatDate(iso, "medium");
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} day${d === 1 ? "" : "s"} ago`;
  return formatDate(iso, "medium");
}

/** ISO date → readable date. Style choices match Intl DateStyle. */
export function formatDate(
  iso: string | null | undefined,
  style: "short" | "medium" | "long" | "full" = "medium",
  locale?: string
): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(locale, { dateStyle: style });
}

/** ISO datetime → readable "Nov 12, 2026 · 3:24 PM" style. */
export function formatDateTime(
  iso: string | null | undefined,
  locale?: string
): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
}
