import type { Metadata } from "next";
import { IntegrationsHubPage } from "@/components/site/marketing/integrations-hub";
import { integrationCards } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "Integrations — Zivvy",
  description:
    "Explore integration patterns for Slack, Salesforce, HubSpot, Zapier, and Google Drive."
};

export default function IntegrationsPage() {
  return <IntegrationsHubPage items={integrationCards} />;
}
