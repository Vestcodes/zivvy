/**
 * Edge middleware — localised pricing v1.
 *
 * On every non-static request:
 *   1. Honour a `?zv_region=XX` override — writes cookies + 307s to the same
 *      URL without the query param so the address bar stays clean and
 *      Googlebot never indexes a rewritten URL.
 *   2. Otherwise, if `zv_country` cookie is missing, derive it from the
 *      `x-vercel-ip-country` header and stamp the three cookies:
 *        • `zv_country` — ISO-3166 alpha-2 (uppercase)
 *        • `zv_currency` — ISO-4217 (uppercase)
 *        • `zv_ppp_bp` — PPP factor in basis points (integer, 10000 = 1.0)
 *
 * Cookies are httpOnly=false so the `useRegion()` client hook can read
 * them; SameSite=Lax; Secure in production; path=/; 30-day expiry.
 *
 * The matcher excludes _next/static, _next/image, favicon, /api and any
 * file extension — the middleware has no business firing on those.
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  normalizeCountryCode,
  pppFactorToBasisPoints,
  resolveCurrency,
  resolvePpp
} from "@/lib/pricing";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const IS_PROD = process.env.NODE_ENV === "production";
const OVERRIDE_PARAM = "zv_region";

function baseCookieOpts() {
  return {
    httpOnly: false,
    sameSite: "lax" as const,
    secure: IS_PROD,
    path: "/",
    maxAge: COOKIE_MAX_AGE
  };
}

function writeRegionCookies(
  response: NextResponse,
  country: string,
  { includeCountry }: { includeCountry: boolean } = { includeCountry: true }
) {
  const currency = resolveCurrency(country);
  const pppFactor = resolvePpp(country);
  const pppBp = pppFactorToBasisPoints(pppFactor);
  const opts = baseCookieOpts();

  if (includeCountry) {
    response.cookies.set("zv_country", country, opts);
  }
  response.cookies.set("zv_currency", currency, opts);
  response.cookies.set("zv_ppp_bp", String(pppBp), opts);
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const overrideRaw = url.searchParams.get(OVERRIDE_PARAM);

  // ── QA override path ────────────────────────────────────────────────────
  // Anyone can hit `?zv_region=IN` to preview localised pricing. We validate
  // the code, write the cookies, and 307 to the same URL with the override
  // stripped so the cookie value drives every subsequent render.
  if (overrideRaw !== null) {
    const cleaned = url.clone();
    cleaned.searchParams.delete(OVERRIDE_PARAM);
    const override = normalizeCountryCode(overrideRaw);
    const response = NextResponse.redirect(cleaned, 307);
    if (override) {
      writeRegionCookies(response, override, { includeCountry: true });
    }
    return response;
  }

  // ── First-time visitor path ─────────────────────────────────────────────
  // If the user already has a `zv_country` cookie, do nothing — the
  // resolver in `lib/region.ts` handles the read side. Only mint fresh
  // cookies on the very first request in a session.
  const existing = normalizeCountryCode(request.cookies.get("zv_country")?.value);
  if (existing) {
    return NextResponse.next();
  }

  const geoHeader =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    null;
  const country = normalizeCountryCode(geoHeader) ?? "US";

  const response = NextResponse.next();
  writeRegionCookies(response, country, { includeCountry: true });
  return response;
}

/**
 * Skip everything under _next/static, _next/image, favicon, images and API
 * routes. The `zv_region` override *does* need to work everywhere else —
 * marketing pages, blog, app shell — so we don't over-narrow.
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|.*\\.[a-zA-Z0-9]+$).*)"
  ]
};
