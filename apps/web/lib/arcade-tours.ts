/**
 * Product-tour catalog (Supademo embeds preferred; Arcade field names kept).
 *
 * Populate `arcadeViewUrl` / `arcadeEmbedUrl` with Supademo share / embed URLs
 * after recording in the Chrome extension (or Desktop app). Until then, the
 * product-tour page falls back to the self-hosted Business mp4 for the hero
 * and deep-links modules to marketing feature / integration pages.
 *
 * Capture / wire-up checklist (Supademo MCP + Chrome extension):
 * 1. Workspace folder: "Zivvy Product Tours" (Demo folder)
 * 2. Record each tour on https://zivvy.xyz as demo@zivvy.xyz (Business / demo-arcade)
 *    via Chrome extension → Start Recording (MCP cannot start capture)
 * 3. get_demo_embed_code + sharing.visibility=public, then paste view/embed URLs here
 * 4. Redeploy zivvy-web
 */

export type ArcadeTourModule =
  | "all"
  | "crm-sales"
  | "stock"
  | "accounting"
  | "hr-projects"
  | "manufacturing"
  | "banking"
  | "integrations";

export type ArcadeTour = {
  id: string;
  module: ArcadeTourModule;
  /** Anchor on /product-tour */
  anchor: string;
  title: string;
  description: string;
  /** Approximate chapter start on the self-hosted full tour (fallback). */
  chapterTime?: string;
  /** Supademo (or Arcade) share / editor link */
  arcadeViewUrl?: string | null;
  /** iframe-friendly embed URL (Supademo embed_v=2 or Arcade publish embed) */
  arcadeEmbedUrl?: string | null;
  /** Poster / thumbnail for dialog */
  thumbnailSrc: string;
  /** Where to send users when Supademo/Arcade URL is not ready yet */
  fallbackHref: string;
  fallbackLabel: string;
  isHero?: boolean;
  /** SEO keyword phrase */
  keyword: string;
};

const POSTER = "/videos/zivvy-product-tour-poster.jpg";

/**
 * Fill arcadeViewUrl / arcadeEmbedUrl after Supademo captures are published.
 * Workspace: My Company (cms0zfb8g023d0n0jzgy7f35e) · Folder: Zivvy Product Tours
 * Showcase scaffold: cms0znjkc053eoa22lyt744sm
 */
export const arcadeTours: ArcadeTour[] = [
  {
    id: "zivvy-all-modules",
    module: "all",
    anchor: "full-tour",
    title: "Full Business tour",
    description:
      "CRM through manufacturing in one calm walkthrough — dashboard, cash cycle, stock, books, people, and make/inspect.",
    chapterTime: "00:00",
    arcadeViewUrl: null,
    arcadeEmbedUrl: null,
    thumbnailSrc: POSTER,
    fallbackHref: "/videos/zivvy-product-tour.mp4",
    fallbackLabel: "Play self-hosted tour",
    isHero: true,
    keyword: "zivvy erp product tour"
  },
  {
    id: "zivvy-crm-sales",
    module: "crm-sales",
    anchor: "crm",
    title: "CRM & Sales",
    description: "Lead → quotation → sales order → invoice without hopping tools.",
    chapterTime: "00:25",
    arcadeViewUrl: null,
    arcadeEmbedUrl: null,
    thumbnailSrc: POSTER,
    fallbackHref: "/use-cases/crm-automation",
    fallbackLabel: "CRM automation",
    keyword: "zivvy crm sales tour"
  },
  {
    id: "zivvy-stock",
    module: "stock",
    anchor: "stock",
    title: "Stock & Inventory",
    description: "Items, warehouses, and stock movements as the ops backbone.",
    chapterTime: "01:00",
    arcadeViewUrl: null,
    arcadeEmbedUrl: null,
    thumbnailSrc: POSTER,
    fallbackHref: "/solutions/distribution",
    fallbackLabel: "Distribution solution",
    keyword: "zivvy inventory stock tour"
  },
  {
    id: "zivvy-accounting",
    module: "accounting",
    anchor: "accounting",
    title: "Accounting & Payments",
    description: "Ledgers, payment entries, and customer cash — separate from Zivvy seat billing.",
    chapterTime: "01:00",
    arcadeViewUrl: null,
    arcadeEmbedUrl: null,
    thumbnailSrc: POSTER,
    fallbackHref: "/industries/finance",
    fallbackLabel: "Finance industry",
    keyword: "zivvy accounting payments tour"
  },
  {
    id: "zivvy-hr-projects",
    module: "hr-projects",
    anchor: "hr",
    title: "HR & Projects",
    description: "Employees, leave, tasks, and timesheets in the same workspace.",
    chapterTime: "01:00",
    arcadeViewUrl: null,
    arcadeEmbedUrl: null,
    thumbnailSrc: POSTER,
    fallbackHref: "/solutions/hr-teams",
    fallbackLabel: "HR teams",
    keyword: "zivvy hr projects tour"
  },
  {
    id: "zivvy-manufacturing",
    module: "manufacturing",
    anchor: "manufacturing",
    title: "Manufacturing & Quality",
    description: "BOMs, work orders, and quality checks on the Business tier.",
    chapterTime: "01:40",
    arcadeViewUrl: null,
    arcadeEmbedUrl: null,
    thumbnailSrc: POSTER,
    fallbackHref: "/solutions/manufacturing",
    fallbackLabel: "Manufacturing solution",
    keyword: "zivvy manufacturing quality tour"
  },
  {
    id: "zivvy-banking",
    module: "banking",
    anchor: "banking",
    title: "Banking",
    description: "Reconcile bank activity against the same books your team already trusts.",
    chapterTime: "01:00",
    arcadeViewUrl: null,
    arcadeEmbedUrl: null,
    thumbnailSrc: POSTER,
    fallbackHref: "/addons/ecommerce-integrations",
    fallbackLabel: "Ecommerce add-on",
    keyword: "zivvy banking reconciliation tour"
  },
  {
    id: "zivvy-integrations",
    module: "integrations",
    anchor: "integrations",
    title: "Integrations",
    description: "HMAC webhooks, REST, Zapier/n8n — Zivvy stays the system of record.",
    chapterTime: undefined,
    arcadeViewUrl: null,
    arcadeEmbedUrl: null,
    thumbnailSrc: POSTER,
    fallbackHref: "/integrations",
    fallbackLabel: "Integrations hub",
    keyword: "zivvy webhooks api integrations tour"
  }
];

export const heroArcadeTour = arcadeTours.find((t) => t.isHero)!;
export const moduleArcadeTours = arcadeTours.filter((t) => !t.isHero);

export function arcadeTourByAnchor(anchor: string): ArcadeTour | undefined {
  return arcadeTours.find((t) => t.anchor === anchor);
}

/** True when at least one Supademo/Arcade embed/view URL is configured. */
export function hasArcadeEmbeds(): boolean {
  return arcadeTours.some((t) => Boolean(t.arcadeEmbedUrl || t.arcadeViewUrl));
}
