import type { Metadata } from "next";
import { UseCasesHubPage } from "@/components/site/marketing/use-cases-hub";
import { useCaseCards } from "@/lib/marketing-content";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Use Cases",
  description:
    "Concrete workflows mapped to Zivvy REST resources and webhook events — project delivery, onboarding, support, planning, CRM automation.",
  canonicalPath: "/use-cases",
  ogImage: "/og/use-cases.png"
});

export default function UseCasesPage() {
  return <UseCasesHubPage items={useCaseCards} />;
}
