import type { Metadata } from "next";
import { ModuleHome } from "@/components/modules/module-home";

export const metadata: Metadata = { title: "Assets — Zivvy" };

export default function AssetsPage() {
  return <ModuleHome moduleKey="assets" />;
}
