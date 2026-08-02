import type { Metadata } from "next";
import { SupportHubPage } from "@/components/site/marketing/support-hub";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Support, Documentation and API Reference",
  description:
    "Search Zivvy docs, the REST + webhook API reference at integrate.zivvy.xyz/docs, guides, changelog, and roadmap — same tenant model, no login required.",
  canonicalPath: "/support"
});

export default function SupportPage() {
  return <SupportHubPage />;
}
