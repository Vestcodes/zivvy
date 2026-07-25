import { WebhooksPageContent } from "@/components/site/marketing/webhooks-page";
import { makeMetadata } from "@/lib/seo";

export const metadata = makeMetadata({
  title: "Webhooks — Zivvy for Developers",
  description:
    "Real-time event delivery for every resource in Zivvy — CRM, sales, billing, banking, stock, HR, projects and manufacturing. Design, payload envelope, HMAC-SHA256 signature verification, delivery guarantees, and registration API. Coming soon; the design is stable — prototype now.",
  canonicalPath: "/developers/webhooks"
});

export default function WebhooksPage() {
  return <WebhooksPageContent />;
}
