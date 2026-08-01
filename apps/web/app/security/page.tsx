import { SecurityPageContent } from "@/components/site/marketing/security-page";
import { makeMetadata } from "@/lib/seo";

export const metadata = makeMetadata({
  title: "Security",
  description:
    "How Zivvy handles encryption, tenant isolation, HMAC-signed webhooks, per-tenant API keys, session cookies, CSRF and GDPR posture. Honest about what we have — and don't yet.",
  canonicalPath: "/security"
});

export default function SecurityPage() {
  return <SecurityPageContent />;
}
