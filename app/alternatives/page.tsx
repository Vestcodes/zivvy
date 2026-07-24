import type { Metadata } from "next";
import { AlternativesHubPage } from "@/components/site/marketing/alternatives-hub";
import { alternativeCards } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "Alternatives — Zivvy",
  description:
    "Explore alternatives and migration guides for teams evaluating operational software options."
};

export default function AlternativesPage() {
  return <AlternativesHubPage items={alternativeCards} />;
}
