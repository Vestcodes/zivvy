import { IntegrationsHubPage } from "@/components/site/marketing/integrations-hub";
import { integrationCards } from "@/lib/marketing-content";
import { makeMetadata } from "@/lib/seo";

export const metadata = makeMetadata({
  title: "Integrations with Slack, Xero, Stripe and More",
  description: "Connect Zivvy to Slack, Xero, Stripe, Shopify, Google Drive, Zapier and more. Every integration is a REST endpoint. No middleware required.",
  canonicalPath: "/integrations",
});

export default function IntegrationsPage() {
  return <IntegrationsHubPage items={integrationCards} />;
}
