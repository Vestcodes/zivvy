import {
  breadcrumbJsonLd,
  faqJsonLd,
  orgJsonLd,
  productJsonLd,
  softwareAppJsonLd,
  type BreadcrumbLdItem,
  type FaqEntry
} from "@/lib/seo";

/**
 * Server-safe JSON-LD script tags. Every component here renders a
 * `<script type="application/ld+json">` payload built from `lib/seo.ts`.
 *
 * Pattern (from Next.js docs): serialize with `JSON.stringify` and inject
 * via `dangerouslySetInnerHTML`. Do NOT pass the JSON as a React child —
 * whitespace / escaping will be wrong and validators reject the payload.
 */

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

function JsonLdScript({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Generic JSON-LD — pass one object or an array of schema graphs. */
export function JsonLd({ data }: JsonLdProps) {
  return <JsonLdScript data={data} />;
}

/** Global Organization schema. Render once, in the root layout. */
export function OrganizationJsonLd() {
  return <JsonLdScript data={orgJsonLd()} />;
}

/** Global SoftwareApplication schema. Render once, in the root layout. */
export function SoftwareApplicationJsonLd() {
  return <JsonLdScript data={softwareAppJsonLd()} />;
}

/** FAQ schema — attach to pages that answer common questions. */
export function FaqJsonLd({ faqs }: { faqs: FaqEntry[] }) {
  if (!faqs?.length) return null;
  return <JsonLdScript data={faqJsonLd(faqs)} />;
}

/** BreadcrumbList schema — attach to detail pages. */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbLdItem[] }) {
  if (!items?.length) return null;
  return <JsonLdScript data={breadcrumbJsonLd(items)} />;
}

interface ProductJsonLdInput {
  name: string;
  description: string;
  priceUsd: number;
}

/** Product schema — one per priced offering. */
export function ProductJsonLd({ name, description, priceUsd }: ProductJsonLdInput) {
  return <JsonLdScript data={productJsonLd(name, description, priceUsd)} />;
}
