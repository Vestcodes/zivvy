import type { Metadata } from "next";
import { ModuleHome } from "@/components/modules/module-home";

export const metadata: Metadata = { title: "Inventory — Zivvy" };

export default function StockHome() {
  return <ModuleHome moduleKey="stock" />;
}
