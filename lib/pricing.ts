/**
 * Localised pricing v1 — country → currency, PPP factor, FX conversion.
 *
 * Mirror of the backend `regions.py`. Kept as a pure module (no Next.js
 * imports) so both the Edge middleware AND client components can import
 * it without pulling `next/headers`.
 *
 * Design decisions:
 *   • Country codes are always uppercased before lookup.
 *   • Currency codes are always uppercased ISO-4217.
 *   • Any unknown country falls back to USD at PPP 1.0.
 *   • The FX table is static per quarter; drift is acceptable because we
 *     never charge the localised amount — Polar checkout still runs in
 *     USD (v1). See `backend_contract` for the eventual v2 gating.
 *   • PPP is a MULTIPLIER on base USD, applied BEFORE FX conversion.
 *
 * Rounding rules (see `roundLocalPrice`):
 *   • Zero-decimal currencies (JPY, KRW, VND, CLP, IDR) → nearest whole unit.
 *   • Any localised amount ≥ 10 → nearest whole unit (ERP positioning; no
 *     ".99" consumer-y endings).
 *   • Amount < 10 → 2 decimals, but never a "…99" ending — those bump up
 *     to the next whole unit.
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

  // Emerging markets — PPP-tier countries first
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

// ─── FX + PPP ───────────────────────────────────────────────────────────────

/**
 * USD-anchored FX rates. Static v1 table refreshed manually per quarter.
 * Last updated 2026-Q3. Drift is acceptable because checkout is USD-only.
 */
export const FX_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.79,
  CAD: 1.37,
  AUD: 1.53,
  NZD: 1.66,
  CHF: 0.88,
  SEK: 10.5,
  NOK: 10.8,
  DKK: 6.9,
  PLN: 4.1,
  CZK: 23,
  HUF: 355,
  RON: 4.6,
  BGN: 1.82,
  INR: 84,
  BRL: 5.5,
  MXN: 20,
  IDR: 15800,
  JPY: 155,
  SGD: 1.34,
  HKD: 7.8,
  TWD: 32,
  KRW: 1350,
  MYR: 4.7,
  THB: 34.5,
  PHP: 57,
  VND: 25000,
  AED: 3.67,
  SAR: 3.75,
  ILS: 3.7,
  TRY: 34,
  ZAR: 18.5,
  EGP: 49,
  NGN: 1600,
  KES: 129,
  ARS: 950,
  CLP: 940,
  COP: 4100,
  PEN: 3.8,
  CNY: 7.2,
  PKR: 278,
  BDT: 118,
  LKR: 300,
  UAH: 41
};

/**
 * PPP discount factors — conservative v1. Keys are ISO-3166 alpha-2 upper.
 * A value of `1.0` means "no discount" (the default for every country not
 * listed here). See design brief `ppp_factors` for rationale.
 */
export const PPP_FACTORS: Record<string, number> = {
  IN: 0.4,
  BR: 0.5,
  MX: 0.6,
  ID: 0.5,
  PL: 0.7
};

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

/** Country → PPP multiplier. Unknown / non-PPP countries return 1.0. */
export function resolvePpp(country: string | null | undefined): number {
  if (!country) return 1;
  return PPP_FACTORS[country.toUpperCase()] ?? 1;
}

/** Country → derived region tag, useful for tax / GDPR copy. */
export function resolveRegion(country: string | null | undefined): string {
  if (!country) return "row"; // rest-of-world
  const code = country.toUpperCase();
  if (code === "US") return "us";
  if (code === "GB") return "gb";
  if (code === "CA") return "ca";
  if (EU_COUNTRIES.has(code)) return "eu";
  if (PPP_FACTORS[code] !== undefined) return "ppp";
  return "row";
}

// ─── Rounding + format ─────────────────────────────────────────────────────

/**
 * Convert a raw computed local amount into the display value. Never returns
 * a ".99" tail — those bump to the next whole unit so the ERP tone stays
 * clean.
 */
export function roundLocalPrice(amount: number, currency: string): number {
  if (!Number.isFinite(amount)) return 0;
  if (ZERO_DECIMAL.has(currency)) return Math.round(amount);
  if (amount >= 10) return Math.round(amount);
  const twoDecimals = Math.round(amount * 100) / 100;
  const fractional = twoDecimals - Math.floor(twoDecimals);
  // Never "…99" — reads as consumer-y; bump to next whole.
  if (fractional >= 0.985) return Math.ceil(twoDecimals);
  return twoDecimals;
}

export interface LocalisedPriceResult {
  amount: number;
  currency: string;
  pppFactor: number;
  baseUsd: number;
}

/**
 * The one function every UI/back-end code path should call. Given a USD
 * base price and a country code, returns the display amount + currency +
 * PPP factor. All rounding/FX logic lives here.
 */
export function computeLocalPrice(
  usd: number,
  country: string | null | undefined
): LocalisedPriceResult {
  const pppFactor = resolvePpp(country);
  const currency = resolveCurrency(country);
  const fxRate = FX_RATES[currency] ?? 1;
  const adjustedUsd = usd * pppFactor;
  const amount = roundLocalPrice(adjustedUsd * fxRate, currency);
  return { amount, currency, pppFactor, baseUsd: usd };
}

export interface FormatLocalisedPriceOpts {
  currency: string;
  /** PPP factor as a multiplier on USD (0.4 = 60% off). Default: 1. */
  ppp?: number;
  /** BCP-47 locale for formatting. Default: "en-US". */
  locale?: string;
}

/**
 * `<LocalisedPrice>` glue. Callers pass USD *cents* so integer maths stays
 * exact all the way from webhook to display. PPP is applied here so the
 * component itself stays declarative.
 *
 *   formatLocalisedPrice(1800, { currency: "INR", ppp: 0.4 }) → "₹605"
 */
export function formatLocalisedPrice(
  usdCents: number,
  opts: FormatLocalisedPriceOpts
): string {
  const { currency: rawCurrency, ppp = 1, locale = "en-US" } = opts;
  const currency = SUPPORTED_CURRENCIES.has(rawCurrency.toUpperCase())
    ? rawCurrency.toUpperCase()
    : "USD";
  const usd = (usdCents / 100) * ppp;
  const fxRate = FX_RATES[currency] ?? 1;
  const amount = roundLocalPrice(usd * fxRate, currency);
  const zeroDecimal = ZERO_DECIMAL.has(currency) || amount >= 10;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: zeroDecimal ? 0 : 2,
      maximumFractionDigits: zeroDecimal ? 0 : 2
    }).format(amount);
  } catch {
    // Defensive fallback — the Intl currency list is large but not
    // exhaustive on every JS runtime. Show a plain formatted number with
    // the currency code appended.
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: zeroDecimal ? 0 : 2,
      maximumFractionDigits: zeroDecimal ? 0 : 2
    }).format(amount)} ${currency}`;
  }
}

// ─── Cookie serialisation helpers ──────────────────────────────────────────

/** Serialise a PPP factor to basis points for cookie transport. 1.0 → 10000. */
export function pppFactorToBasisPoints(factor: number): number {
  if (!Number.isFinite(factor)) return 10000;
  return Math.max(0, Math.round(factor * 10000));
}

/** Inverse of `pppFactorToBasisPoints`. Invalid input → 1.0 (no discount). */
export function pppBasisPointsToFactor(bp: number | string | null | undefined): number {
  if (bp === null || bp === undefined || bp === "") return 1;
  const n = typeof bp === "string" ? Number(bp) : bp;
  if (!Number.isFinite(n) || n <= 0) return 1;
  return n / 10000;
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
