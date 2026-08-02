import type { Metadata } from "next";
import { AlternativesHubPage } from "@/components/site/marketing/alternatives-hub";
import { BreadcrumbJsonLd } from "@/components/site/marketing/seo-scripts";
import { alternativeCards } from "@/lib/marketing-content";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Alternatives to Odoo, Zoho and Legacy ERP",
  description:
    "Migration guides from Odoo, Zoho, and legacy ERP — mapped to Zivvy tenants, REST resources, and webhook events. No feature bingo.",
  canonicalPath: "/alternatives"
});

export default function AlternativesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "/" },
        { name: "Alternatives", url: "/alternatives" }
      ]} />
      <AlternativesHubPage items={alternativeCards} />
    </>
  );
}
