import type { Metadata } from "next";
import { ModuleHome } from "@/components/modules/module-home";

export const metadata: Metadata = { title: "Finance — Zivvy" };

export default function FinanceHome() {
  return <ModuleHome moduleKey="finance" />;
}
