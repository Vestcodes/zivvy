import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight edge middleware.
 *
 * Primary purpose: ensure marketing pages are never intercepted or redirected
 * for logged-in users. The marketing site and the authenticated app share one
 * domain (zivvy.xyz), so the middleware explicitly marks marketing paths as
 * pass-through — no auth-based redirects, no route-group interference.
 */

/** Top-level segments that belong to the marketing site and must never be
 *  intercepted, redirected, or wrapped by the authenticated app shell. */
const MARKETING_PREFIXES = new Set([
  "about",
  "acceptable-use",
  "addons",
  "alternatives",
  "blog",
  "careers",
  "compare",
  "contact",
  "cookies",
  "developers",
  "dpa",
  "features",
  "forgot-password",
  "industries",
  "integrations",
  "login",
  "pricing",
  "privacy",
  "product-tour",
  "refunds",
  "resources",
  "roadmap",
  "security",
  "signup",
  "solutions",
  "status",
  "support",
  "terms",
  "update-password",
  "use-cases",
]);

/** Paths handled by Next.js internals, static files, or API rewrites. */
function isInternalPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/method") ||
    pathname.startsWith("/files") ||
    pathname.startsWith("/private/files") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/socket.io") ||
    pathname.startsWith("/app") ||
    pathname.startsWith("/desk") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal/static/API paths entirely.
  if (isInternalPath(pathname)) {
    return NextResponse.next();
  }

  // Extract the first URL segment (e.g. "/blog/my-post" -> "blog").
  const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";

  // Marketing pages: always pass through without any redirects.
  // This header can be read by layouts if needed, but its main purpose
  // is to ensure the response passes through cleanly.
  if (MARKETING_PREFIXES.has(firstSegment)) {
    const response = NextResponse.next();
    response.headers.set("x-zivvy-route-kind", "marketing");
    return response;
  }

  // Everything else (app routes, module routes, home) passes through normally.
  return NextResponse.next();
}

export const config = {
  // Run on all paths except static assets and Next.js internals.
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|apple-icon|opengraph-image).*)",
  ],
};
