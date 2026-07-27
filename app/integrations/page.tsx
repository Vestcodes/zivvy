import { IntegrationsHubPage } from "@/components/site/marketing/integrations-hub";
import { integrationCards } from "@/lib/marketing-content";
import { makeMetadata } from "@/lib/seo";

export const metadata = makeMetadata({
  title: "Integrations",
  description: "Explore integration patterns for Slack, Salesforce, HubSpot, Zapier, and Google Drive.",
  canonicalPath: "/integrations",
});

export default function IntegrationsPage() {
  return <IntegrationsHubPage items={integrationCards} />;
}
