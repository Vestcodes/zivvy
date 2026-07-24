import type { Metadata } from "next";
import { SupportHubPage } from "@/components/site/marketing/support-hub";

export const metadata: Metadata = {
  title: "Support — Zivvy",
  description:
    "Access documentation, help center resources, changelog updates, and product roadmap notes."
};

export default function SupportPage() {
  return <SupportHubPage />;
}
