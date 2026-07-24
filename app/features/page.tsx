import type { Metadata } from "next";
import { FeaturesHubPage } from "@/components/site/marketing/features-hub";
import { featureCards } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "Features — Zivvy",
  description: "One product for sales, stock, accounting, HR, projects, and manufacturing."
};

export default function FeaturesPage() {
  return <FeaturesHubPage deepDives={featureCards} />;
}
