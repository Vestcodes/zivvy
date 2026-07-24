import type { Metadata } from "next";
import { RoadmapPageContent } from "@/components/site/marketing/support-subpages";

export const metadata: Metadata = {
  title: "Roadmap — Zivvy",
  description: "See what Zivvy is building now, next, and later across product and platform capabilities."
};

export default function RoadmapPage() {
  return <RoadmapPageContent />;
}
