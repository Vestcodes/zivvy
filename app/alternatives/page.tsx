import type { Metadata } from "next";
import { AlternativesHubPage } from "@/components/site/marketing/alternatives-hub";
import { alternativeCards } from "@/lib/marketing-content";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Alternatives",
  description:
    "Migration guides from Odoo, Zoho, and legacy ERP — mapped to Zivvy tenants, REST resources, and webhook events. No feature bingo.",
  canonicalPath: "/alternatives",
  ogImage: "/og/alternatives.png"
});

export default function AlternativesPage() {
  return <AlternativesHubPage items={alternativeCards} />;
}
