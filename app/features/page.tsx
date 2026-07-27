import type { Metadata } from "next";
import { FeaturesHubPage } from "@/components/site/marketing/features-hub";
import { featureCards } from "@/lib/marketing-content";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Features",
  description:
    "Every Zivvy capability is a REST endpoint, a webhook event, and a form in the same tenant. Free, Pro, Business tiers.",
  canonicalPath: "/features"
});

export default function FeaturesPage() {
  return <FeaturesHubPage deepDives={featureCards} />;
}
