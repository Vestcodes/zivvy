import type { Metadata } from "next";
import { HelpCenterPageContent } from "@/components/site/marketing/support-subpages";

export const metadata: Metadata = {
  title: "Help Center — Zivvy",
  description:
    "Find answers on billing, security, account management, and technical troubleshooting."
};

export default function HelpCenterPage() {
  return <HelpCenterPageContent />;
}
