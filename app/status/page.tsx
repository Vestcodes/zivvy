import type { Metadata } from "next";
import { makeMetadata } from "@/lib/seo";
import { StatusPageContent } from "@/components/site/status-page";

export const metadata: Metadata = makeMetadata({
  title: "System status",
  description:
    "Live health of Zivvy app, API, and docs. Incident history and regional notes.",
  canonicalPath: "/status"
});

export default function StatusPage() {
  return <StatusPageContent />;
}
