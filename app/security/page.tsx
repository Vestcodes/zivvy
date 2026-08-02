import { SecurityPageContent } from "@/components/site/marketing/security-page";
import { makeMetadata } from "@/lib/seo";

export const metadata = makeMetadata({
  title: "Security, Encryption and Data Protection",
  description:
    "How Zivvy protects your data with encryption at rest and in transit, tenant isolation, access controls and region-pinned hosting in India, EU or US.",
  canonicalPath: "/security"
});

export default function SecurityPage() {
  return <SecurityPageContent />;
}
