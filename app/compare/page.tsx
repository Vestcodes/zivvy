import type { Metadata } from "next";
import { CompareHubPage } from "@/components/site/marketing/compare-hub";
import { compareCards } from "@/lib/marketing-content";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Compare Zivvy vs Odoo, Zoho and NetSuite",
  description:
    "Side-by-side comparisons of Zivvy against Odoo, Zoho, and NetSuite — pricing model, operator UX, REST + webhook surface, time to value.",
  canonicalPath: "/compare"
});

export default function ComparePage() {
  return <CompareHubPage items={compareCards} />;
}
