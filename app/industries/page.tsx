import type { Metadata } from "next";
import { IndustriesHubPage } from "@/components/site/marketing/industries-hub";
import { industryCards } from "@/lib/marketing-content";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Industries",
  description:
    "Same tenant model, same REST and webhook surface — different defaults for healthcare, education, manufacturing, SaaS, and finance.",
  canonicalPath: "/industries"
});

export default function IndustriesPage() {
  return <IndustriesHubPage items={industryCards} />;
}
