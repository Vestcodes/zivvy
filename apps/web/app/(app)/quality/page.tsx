import type { Metadata } from "next";
import { ModuleHome } from "@/components/modules/module-home";

export const metadata: Metadata = { title: "Quality — Zivvy" };

export default function QualityPage() {
  return <ModuleHome moduleKey="quality" />;
}
