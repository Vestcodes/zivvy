import type { Metadata } from "next";

/**
 * SEO helpers — a single source for page metadata + JSON-LD payloads.
 *
 * `makeMetadata` renders a Next.js Metadata object with sensible defaults
 * (canonical URL, Open Graph, Twitter card). The `*JsonLd` helpers return
 * plain objects — feed them into a `<script type="application/ld+json">`
 * tag (see `components/site/marketing/seo-scripts.tsx`).
 */

export const SITE_ORIGIN = "https://zivvy.xyz";
const TITLE_SUFFIX = " — Zivvy";
const DEFAULT_OG_IMAGE = "/opengraph-image";

export interface MakeMetadataInput {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
}

/**
 * Build a Metadata object with title suffix, canonical, OG, and Twitter.
 * If the passed title already ends with the Zivvy suffix, it is not appended.
 */
export function makeMetadata({
  title,
  description,
  canonicalPath,
  ogImage
}: MakeMetadataInput): Metadata {
  const fullTitle = title.endsWith(TITLE_SUFFIX) ? title : `${title}${TITLE_SUFFIX}`;
  const canonical = `${SITE_ORIGIN}${canonicalPath}`;
  const image = ogImage ?? DEFAULT_OG_IMAGE;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      images: [image],
      type: "website",
      siteName: "Zivvy"
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image]
    }
  };
}

/** Organization — top-level entity for the site. */
export function orgJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Zivvy",
    legalName: "Vestcodes",
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/icon.svg`,
    description:
      "Zivvy is business software for founder-led teams — sales, stock, accounting, HR and manufacturing in one clean product.",
    foundingDate: "2026",
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: "support@zivvy.xyz",
        contactType: "customer support",
        areaServed: ["IN", "EU", "US"],
        availableLanguage: ["en"]
      }
    ],
    sameAs: []
  };
}

/** SoftwareApplication — enables the "app card" rich result. */
export function softwareAppJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Zivvy",
    operatingSystem: "Web",
    applicationCategory: "BusinessApplication",
    description:
      "One product for sales, stock, accounting, HR and manufacturing. Seat-based, self-serve, region-picked.",
    url: SITE_ORIGIN,
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "USD",
        description: "2 seats, sales, CRM, basic stock. No card required."
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "15",
        priceCurrency: "USD",
        description: "Full accounting, stock, HR and projects. Per seat, per month."
      },
      {
        "@type": "Offer",
        name: "Business",
        price: "25",
        priceCurrency: "USD",
        description: "Manufacturing, assets, subcontracting. Per seat, per month."
      }
    ],
    publisher: {
      "@type": "Organization",
      name: "Vestcodes",
      url: SITE_ORIGIN
    }
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/** FAQPage — used on pages that answer common questions. */
export function faqJsonLd(faqs: FaqEntry[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer
      }
    }))
  };
}

export interface BreadcrumbLdItem {
  name: string;
  url: string;
}

/** BreadcrumbList — trail of ancestors for a page. Relative URLs resolve to SITE_ORIGIN. */
export function breadcrumbJsonLd(items: BreadcrumbLdItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_ORIGIN}${item.url}`
    }))
  };
}

/** Product — a single named offering with a monthly USD price. */
export function productJsonLd(
  name: string,
  description: string,
  priceUsd: number
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    brand: { "@type": "Brand", name: "Zivvy" },
    offers: {
      "@type": "Offer",
      price: priceUsd.toString(),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: SITE_ORIGIN
    }
  };
}

export interface VideoLdInput {
  name: string;
  description: string;
  /** Absolute or site-relative URL to the playable video / embed page */
  contentUrl: string;
  /** Absolute or site-relative thumbnail */
  thumbnailUrl: string;
  /** ISO 8601 duration e.g. PT2M */
  duration?: string;
  uploadDate?: string;
}

/** VideoObject — product tour and module demos. */
export function videoJsonLd(video: VideoLdInput): Record<string, unknown> {
  const abs = (url: string) => (url.startsWith("http") ? url : `${SITE_ORIGIN}${url}`);
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.name,
    description: video.description,
    contentUrl: abs(video.contentUrl),
    thumbnailUrl: abs(video.thumbnailUrl),
    uploadDate: video.uploadDate ?? "2026-07-01",
    ...(video.duration ? { duration: video.duration } : {}),
    publisher: {
      "@type": "Organization",
      name: "Vestcodes",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_ORIGIN}/icon.svg`
      }
    }
  };
}

/** ItemList of tour modules for /product-tour. */
export function tourItemListJsonLd(
  items: Array<{ name: string; url: string; position: number }>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Zivvy product tours",
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: item.url.startsWith("http") ? item.url : `${SITE_ORIGIN}${item.url}`
    }))
  };
}
