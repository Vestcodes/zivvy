import type { Metadata } from "next";
import { SupportDocsContent } from "@/components/site/marketing/support-subpages";

export const metadata: Metadata = {
  title: "Documentation — Zivvy",
  description:
    "Read Zivvy documentation for getting started, API references, tutorials, examples, and troubleshooting."
};

export default function SupportDocsPage() {
  return <SupportDocsContent />;
}
