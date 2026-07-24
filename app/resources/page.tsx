import type { Metadata } from "next";
import { ResourcesPageContent } from "@/components/site/marketing/resources-page";

export const metadata: Metadata = {
  title: "Resource Center — Zivvy",
  description:
    "Guides, templates, case studies, webinars, and operational playbooks to help teams execute faster."
};

export default function ResourcesPage() {
  return <ResourcesPageContent />;
}
