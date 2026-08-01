/**
 * JSON-LD structured data injectors for Google + AI answer engines.
 *
 * Every helper renders a <script type="application/ld+json"> tag with a
 * pre-serialized JSON string, using `dangerouslySetInnerHTML`. This is the
 * pattern the Next.js docs recommend — do NOT swap to a React child string
 * or the whitespace + escaping will be wrong.
 */

const BASE = "https://zivvy.xyz";

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Organization — the top-level entity most search engines expect. */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Zivvy",
        legalName: "Vestcodes",
        url: BASE,
        logo: `${BASE}/icon.svg`,
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
      }}
    />
  );
}

/** SoftwareApplication — enables the "app card" rich result. */
export function SoftwareApplicationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Zivvy",
        operatingSystem: "Web",
        applicationCategory: "BusinessApplication",
        description:
          "One product for sales, stock, accounting, HR and manufacturing. Seat-based, self-serve, region-picked.",
        url: BASE,
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
            description: "Full accounting, stock, HR and projects. Per seat, per month.",
            priceValidUntil: "2027-12-31"
          },
          {
            "@type": "Offer",
            name: "Business",
            price: "25",
            priceCurrency: "USD",
            description: "Manufacturing, assets, subcontracting. Per seat, per month.",
            priceValidUntil: "2027-12-31"
          }
        ],
        publisher: {
          "@type": "Organization",
          name: "Vestcodes",
          url: BASE
        }
      }}
    />
  );
}

interface FaqEntry {
  question: string;
  answer: string;
}

export function FaqPageJsonLd({ faqs }: { faqs: FaqEntry[] }) {
  return (
    <JsonLd
      data={{
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
      }}
    />
  );
}

export interface BreadcrumbItemLd {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItemLd[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url.startsWith("http") ? item.url : `${BASE}${item.url}`
        }))
      }}
    />
  );
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  slug: string;
  offers?: Array<{ name: string; price: string; priceCurrency: string; description?: string }>;
}

export function ProductJsonLd({ name, description, slug, offers }: ProductJsonLdProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        brand: { "@type": "Brand", name: "Zivvy" },
        url: `${BASE}${slug}`,
        ...(offers && offers.length > 0
          ? {
              offers: offers.map((o) => ({
                "@type": "Offer",
                name: o.name,
                price: o.price,
                priceCurrency: o.priceCurrency,
                ...(o.description ? { description: o.description } : {})
              }))
            }
          : {})
      }}
    />
  );
}
