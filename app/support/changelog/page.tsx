import type { Metadata } from "next";
import { ChangelogPageContent } from "@/components/site/marketing/support-subpages";

export const metadata: Metadata = {
  title: "Changelog — Zivvy",
  description: "Track new features, performance improvements, bug fixes, and product updates."
};

export default function ChangelogPage() {
  return <ChangelogPageContent />;
}
