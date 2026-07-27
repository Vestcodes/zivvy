import { notFound, redirect } from "next/navigation";
import { fetchBootinfo } from "@/lib/boot-server";
import { AppShell } from "@/components/app/app-shell";
import { MODULE_NAVS } from "@/components/app/sidebar-nav";

interface Props {
  children: React.ReactNode;
  params: Promise<{ mod: string }>;
}

/**
 * Marketing site has explicit routes for these top-level segments.
 * The (modules) dynamic route must never claim them — that would cause
 * Next.js route-group ambiguity and break the marketing pages.
 */
const MARKETING_RESERVED = new Set([
  "support",    // /support, /support/changelog, /support/docs, etc.
  "blog",       // /blog, /blog/[slug]
  "status",     // /status
  "about",      // /about
  "pricing",    // /pricing
  "contact",    // /contact
  "careers",    // /careers
  "security",   // /security
  "resources",  // /resources
  "roadmap",    // /roadmap
  "developers", // /developers/mcp, /developers/webhooks
]);

/**
 * Dynamic module routes (`/crm`, `/purchases`, …) live outside `(app)` so an
 * unknown first segment can `notFound()` instead of soft-redirecting to login
 * via the authenticated layout.
 *
 * Segments that correspond to dedicated marketing pages (e.g. `/support`,
 * `/blog`, `/pricing`) are explicitly excluded via MARKETING_RESERVED so the
 * `(modules)` route group never claims them.
 */
export default async function ModuleSegmentLayout({ children, params }: Props) {
  const { mod } = await params;

  if (MARKETING_RESERVED.has(mod)) {
    notFound();
  }

  if (!MODULE_NAVS[mod]) {
    notFound();
  }

  const boot = await fetchBootinfo();
  if (!boot.logged_in) {
    redirect(`/login?redirect-to=/${encodeURIComponent(mod)}`);
  }

  return <AppShell>{children}</AppShell>;
}
