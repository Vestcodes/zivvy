import type { Metadata } from "next";
import { UseCasesHubPage } from "@/components/site/marketing/use-cases-hub";
import { useCaseCards } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "Use Cases — Zivvy",
  description:
    "Explore practical workflow use cases including project management, onboarding, support, planning, and CRM automation."
};

export default function UseCasesPage() {
  return <UseCasesHubPage items={useCaseCards} />;
}
