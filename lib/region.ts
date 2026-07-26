/**
 * Server-side region resolver.
 *
 * Uses `next/headers` to peek at the incoming request's cookies + Vercel
 * geo headers. Callers get a self-contained region snapshot that maps
 * cleanly onto both `<RegionProvider>` (initial-value prop) and any
 * server-only price rendering path.
 *
 * The resolution order is:
 *   1. Explicit `zv_country` cookie set by middleware.
 *   2. `x-vercel-ip-country` (production) or `x-country-code` (proxies).
 *   3. `US` as a hard fallback.
 *
 * Currency + PPP always derive from the *same* country string — that keeps
 * SSR and client hydration in lockstep even when the cookie set by the
 * middleware only lands on the second request. See `middleware.ts` for
 * the cookie-write side of this contract.
 */

import { cookies, headers } from "next/headers";
import {
  resolveCurrency,
  resolvePpp,
  resolveRegion,
  pppBasisPointsToFactor,
  normalizeCountryCode
} from "@/lib/pricing";

export interface ServerRegionSnapshot {
  /** ISO-3166 alpha-2 (uppercase) — always resolvable. */
  country: string;
  /** ISO-4217 (uppercase) — falls back to `USD` when the country is unknown. */
  currency: string;
  /** PPP multiplier on the base USD price. `1` when no discount applies. */
  pppFactor: number;
  /** Bucketed region tag ("us" | "eu" | "gb" | "ca" | "ppp" | "row"). */
  region: string;
  /** Where the country resolution came from — useful for debugging + logs. */
  source: "cookie" | "geo" | "fallback";
}

/**
 * Read the country the middleware resolved (via `zv_country` cookie) and
 * derive everything else from it. Falls back to the raw Vercel geo header
 * on first-render — same request in which the middleware only just set
 * the cookie via `response.cookies.set()`.
 */
export async function getRegionFromRequestOrCookie(): Promise<ServerRegionSnapshot> {
  const [cookieStore, headersList] = await Promise.all([cookies(), headers()]);

  const cookieCountry = normalizeCountryCode(
    cookieStore.get("zv_country")?.value
  );
  const geoCountry = normalizeCountryCode(
    headersList.get("x-vercel-ip-country") ??
      headersList.get("x-country-code") ??
      headersList.get("cf-ipcountry")
  );

  let country: string;
  let source: ServerRegionSnapshot["source"];
  if (cookieCountry) {
    country = cookieCountry;
    source = "cookie";
  } else if (geoCountry) {
    country = geoCountry;
    source = "geo";
  } else {
    country = "US";
    source = "fallback";
  }

  // Currency: prefer the cookie if middleware wrote it — it's already been
  // validated against `SUPPORTED_CURRENCIES`. Otherwise derive.
  const cookieCurrency = cookieStore.get("zv_currency")?.value?.toUpperCase();
  const currency =
    (cookieCurrency && cookieCurrency.length === 3
      ? cookieCurrency
      : undefined) ?? resolveCurrency(country);

  // PPP: cookie value wins so a `?zv_region=IN` override propagates on the
  // same request. Falls back to computing from the country.
  const cookieBp = cookieStore.get("zv_ppp_bp")?.value;
  const pppFactor = cookieBp
    ? pppBasisPointsToFactor(cookieBp)
    : resolvePpp(country);

  return {
    country,
    currency,
    pppFactor,
    region: resolveRegion(country),
    source
  };
}
