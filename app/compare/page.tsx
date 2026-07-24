import type { Metadata } from "next";
import { CompareHubPage } from "@/components/site/marketing/compare-hub";
import { compareCards } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "Compare — Zivvy",
  description:
    "Compare Zivvy with other business software options and find the best fit for your workflow."
};

export default function ComparePage() {
  return <CompareHubPage items={compareCards} />;
}
