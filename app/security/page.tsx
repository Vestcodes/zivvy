import type { Metadata } from "next";
import { SecurityPageContent } from "@/components/site/marketing/security-page";

export const metadata: Metadata = {
  title: "Security — Zivvy",
  description:
    "Learn how Zivvy handles encryption, data access, privacy, infrastructure security, and operational controls."
};

export default function SecurityPage() {
  return <SecurityPageContent />;
}
