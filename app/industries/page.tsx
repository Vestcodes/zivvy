import type { Metadata } from "next";
import { IndustriesHubPage } from "@/components/site/marketing/industries-hub";
import { industryCards } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "Industries — Zivvy",
  description:
    "See how Zivvy supports healthcare, education, manufacturing, SaaS, and finance operations."
};

export default function IndustriesPage() {
  return <IndustriesHubPage items={industryCards} />;
}
