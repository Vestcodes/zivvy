import type { Metadata } from "next";
import { makeMetadata } from "@/lib/seo";
import { StatusPageContent } from "@/components/site/status-page";

export const metadata: Metadata = makeMetadata({
  title: "System Status, Uptime and Incident History",
  description:
    "Live system status for the Zivvy cloud ERP platform. View current uptime, scheduled maintenance windows, past incidents and subscribe to status notifications.",
  canonicalPath: "/status"
});

export default function StatusPage() {
  return <StatusPageContent />;
}
