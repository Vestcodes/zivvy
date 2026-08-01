import type { Metadata } from "next";
import { RoleManager } from "@/components/settings/role-manager";

export const metadata: Metadata = { title: "Roles — Zivvy" };

export default function RolesPage() {
  return <RoleManager />;
}
