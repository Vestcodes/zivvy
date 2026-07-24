import type { Metadata } from "next";
import { SolutionsHubPage } from "@/components/site/marketing/solutions-hub";
import { solutionCards } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "Solutions — Zivvy",
  description:
    "See how Zivvy supports startups, agencies, enterprises, HR teams, marketing teams, and developers."
};

export default function SolutionsPage() {
  return <SolutionsHubPage items={solutionCards} />;
}
