import type { Metadata } from "next";
import { SolutionsHubPage } from "@/components/site/marketing/solutions-hub";
import { solutionProfiles } from "@/lib/solutions-content";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Solutions",
  description:
    "One tenant shaped to your world — country-ready tax, industry-tuned modules, and team-shaped starters across 22+ profiles.",
  canonicalPath: "/solutions",
  ogImage: "/og/solutions.png"
});

export default function SolutionsPage() {
  return <SolutionsHubPage profiles={solutionProfiles} />;
}
