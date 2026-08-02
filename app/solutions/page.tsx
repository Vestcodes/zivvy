import type { Metadata } from "next";
import { SolutionsHubPage } from "@/components/site/marketing/solutions-hub";
import { BreadcrumbJsonLd } from "@/components/site/marketing/seo-scripts";
import { solutionProfiles } from "@/lib/solutions-content";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Solutions by Industry, Country and Team Size",
  description:
    "One tenant shaped to your world — country-ready tax, industry-tuned modules, and team-shaped starters across 22+ profiles.",
  canonicalPath: "/solutions"
});

export default function SolutionsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "/" },
        { name: "Solutions", url: "/solutions" }
      ]} />
      <SolutionsHubPage profiles={solutionProfiles} />
    </>
  );
}
