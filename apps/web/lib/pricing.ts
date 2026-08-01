/**
 * Localised pricing — country → currency mapping + Intl formatting.
 *
 * Kept as a pure module (no Next.js imports) so both the Edge middleware
 * AND client components can import it without pulling `next/headers`.
 *
 * v2 rip-out: no PPP factors, no FX conversion. Polar-native prices are
 * rendered as-is. Any localised amount + currency the backend supplies is
 * simply formatted via `Intl.NumberFormat` — no client-side maths.
 *
 * Design decisions:
 *   • Country codes are always uppercased before lookup.
 *   • Currency codes are always uppercased ISO-4217.
 *   • Any unknown country falls back to USD.
 */

// ─── Region → Currency ──────────────────────────────────────────────────────

/**
 * All countries we have an explicit currency mapping for. Countries not in
 * this table degrade to USD via `resolveCurrency`.
 */
export const REGION_CURRENCY: Record<string, string> = {
  // US + territories
  US: "USD",
  PR: "USD",
  VI: "USD",
  GU: "USD",
  AS: "USD",
  MP: "USD",
  UM: "USD",

  CA: "CAD",
  GB: "GBP",

  // Euro area
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  IE: "EUR",
  PT: "EUR",
  AT: "EUR",
  FI: "EUR",
  GR: "EUR",
  LU: "EUR",
  MT: "EUR",
  CY: "EUR",
  SK: "EUR",
  SI: "EUR",
  EE: "EUR",
  LV: "EUR",
  LT: "EUR",
  HR: "EUR",

  CH: "CHF",
  LI: "CHF",

  SE: "SEK",
  NO: "NOK",
  DK: "DKK",

  // Central / Eastern Europe
  PL: "PLN",
  CZ: "CZK",
  HU: "HUF",
  RO: "RON",
  BG: "BGN",

  // Emerging markets
  IN: "INR",
  BR: "BRL",
  MX: "MXN",
  ID: "IDR",

  // APAC
  JP: "JPY",
  AU: "AUD",
  NZ: "NZD",
  SG: "SGD",
  HK: "HKD",
  TW: "TWD",
  KR: "KRW",
  MY: "MYR",
  TH: "THB",
  PH: "PHP",
  VN: "VND",
  CN: "CNY",

  // MENA
  AE: "AED",
  SA: "SAR",
  IL: "ILS",
  TR: "TRY",

  // Africa
  ZA: "ZAR",
  EG: "EGP",
  NG: "NGN",
  KE: "KES",

  // Rest of LATAM
  AR: "ARS",
  CL: "CLP",
  CO: "COP",
  PE: "PEN",

  // South Asia (non-IN)
  PK: "PKR",
  BD: "BDT",
  LK: "LKR",

  // Other
  UA: "UAH"
};

/**
 * Euro-area countries. Consumed by tax / GDPR copy modules — kept alongside
 * REGION_CURRENCY so the country → region derivation has one source of truth.
 */
export const EU_COUNTRIES: ReadonlySet<string> = new Set([
  "DE",
  "FR",
  "IT",
  "ES",
  "NL",
  "BE",
  "IE",
  "PT",
  "AT",
  "FI",
  "GR",
  "LU",
  "MT",
  "CY",
  "SK",
  "SI",
  "EE",
  "LV",
  "LT",
  "HR"
]);

/**
 * Every currency the app understands. Anything else degrades to USD in
 * `resolveCurrency` — belt and braces against a mistyped `REGION_CURRENCY`
 * entry that could otherwise pass through to Intl.NumberFormat and throw.
 */
export const SUPPORTED_CURRENCIES: ReadonlySet<string> = new Set([
  "USD",
  "CAD",
  "GBP",
  "EUR",
  "CHF",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "CZK",
  "HUF",
  "RON",
  "BGN",
  "INR",
  "BRL",
  "MXN",
  "IDR",
  "JPY",
  "AUD",
  "NZD",
  "SGD",
  "HKD",
  "TWD",
  "KRW",
  "MYR",
  "THB",
  "PHP",
  "VND",
  "AED",
  "SAR",
  "ILS",
  "TRY",
  "ZAR",
  "EGP",
  "NGN",
  "KES",
  "ARS",
  "CLP",
  "COP",
  "PEN",
  "CNY",
  "PKR",
  "BDT",
  "LKR",
  "UAH"
]);

/** Currencies that skip fractional digits by convention. */
export const ZERO_DECIMAL: ReadonlySet<string> = new Set([
  "JPY",
  "KRW",
  "VND",
  "CLP",
  "IDR"
]);

// ─── Resolvers ──────────────────────────────────────────────────────────────

/**
 * Country → currency, with defensive fallback to USD. `null | undefined | ""`
 * or an unknown country returns "USD". A value present in REGION_CURRENCY but
 * absent from SUPPORTED_CURRENCIES also degrades to USD.
 */
export function resolveCurrency(country: string | null | undefined): string {
  if (!country) return "USD";
  const code = country.toUpperCase();
  const mapped = REGION_CURRENCY[code];
  if (!mapped) return "USD";
  if (!SUPPORTED_CURRENCIES.has(mapped)) return "USD";
  return mapped;
}

/** Country → derived region tag, useful for tax / GDPR copy. */
export function resolveRegion(country: string | null | undefined): string {
  if (!country) return "row"; // rest-of-world
  const code = country.toUpperCase();
  if (code === "US") return "us";
  if (code === "GB") return "gb";
  if (code === "CA") return "ca";
  if (EU_COUNTRIES.has(code)) return "eu";
  return "row";
}

// ─── Format ────────────────────────────────────────────────────────────────

export interface FormatLocalisedPriceOpts {
  currency: string;
  /** BCP-47 locale for formatting. Default: "en-US". */
  locale?: string;
}

/**
 * Format an amount in the given currency using `Intl.NumberFormat`. Amount
 * is expressed in the currency's native units (e.g. dollars, not cents).
 *
 * The backend `get_localised_pricing` endpoint already returns a `formatted`
 * string — prefer that. This helper exists for callsites that need to render
 * a plain USD figure client-side (add-ons, seat deltas) without hitting the
 * pricing endpoint.
 *
 *   formatLocalisedPrice(18, { currency: "USD" }) → "$18"
 */
export function formatLocalisedPrice(
  amount: number,
  opts: FormatLocalisedPriceOpts
): string {
  const { currency: rawCurrency, locale = "en-US" } = opts;
  const currency = SUPPORTED_CURRENCIES.has(rawCurrency.toUpperCase())
    ? rawCurrency.toUpperCase()
    : "USD";
  const zeroDecimal = ZERO_DECIMAL.has(currency) || amount >= 10;
  const value = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: zeroDecimal ? 0 : 2,
      maximumFractionDigits: zeroDecimal ? 0 : 2
    }).format(value);
  } catch {
    // Defensive fallback — the Intl currency list is large but not
    // exhaustive on every JS runtime. Show a plain formatted number with
    // the currency code appended.
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: zeroDecimal ? 0 : 2,
      maximumFractionDigits: zeroDecimal ? 0 : 2
    }).format(value)} ${currency}`;
  }
}

/**
 * Best-effort ISO-3166 alpha-2 validator. Middleware uses this to reject a
 * malformed `?zv_region=` override before writing it to a cookie.
 */
export function normalizeCountryCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return null;
  return code;
}
