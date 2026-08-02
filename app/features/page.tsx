import type { Metadata } from "next";
import { FeaturesHubPage } from "@/components/site/marketing/features-hub";
import { BreadcrumbJsonLd } from "@/components/site/marketing/seo-scripts";
import { featureCards } from "@/lib/marketing-content";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "All Features for Sales, Accounting, HR and More",
  description:
    "Every Zivvy capability is a REST endpoint, a webhook event, and a form in the same tenant. Free, Pro, Business tiers.",
  canonicalPath: "/features"
});

export default function FeaturesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "/" },
        { name: "Features", url: "/features" }
      ]} />
      <FeaturesHubPage deepDives={featureCards} />
    </>
  );
}
