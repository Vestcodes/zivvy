import type { Metadata } from "next";
import { AutoList } from "@/components/auto/auto-list";

export const metadata: Metadata = { title: "Quality — Zivvy" };

export default function QualityPage() {
  return (
    <AutoList
      doctype="Quality Inspection"
      basePath="/quality"
      title="Quality inspections"
    />
  );
}
