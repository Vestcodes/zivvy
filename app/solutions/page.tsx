import type { Metadata } from "next";
import { SolutionsHubPage } from "@/components/site/marketing/solutions-hub";
import { solutionCards } from "@/lib/marketing-content";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Solutions",
  description:
    "One tenant, one auth boundary, one webhook stream — configured for startups, agencies, enterprises, HR, marketing, and developers.",
  canonicalPath: "/solutions",
  ogImage: "/og/solutions.png"
});

export default function SolutionsPage() {
  return <SolutionsHubPage items={solutionCards} />;
}
