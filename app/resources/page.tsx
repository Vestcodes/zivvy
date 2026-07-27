import { ResourcesPageContent } from "@/components/site/marketing/resources-page";
import { makeMetadata } from "@/lib/seo";

export const metadata = makeMetadata({
  title: "Resource Center",
  description: "Guides, templates, case studies, webinars, and operational playbooks to help teams execute faster.",
  canonicalPath: "/resources",
});

export default function ResourcesPage() {
  return <ResourcesPageContent />;
}
