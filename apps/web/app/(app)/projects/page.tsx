import type { Metadata } from "next";
import { ModuleHome } from "@/components/modules/module-home";

export const metadata: Metadata = { title: "Projects — Zivvy" };

export default function ProjectsPage() {
  return <ModuleHome moduleKey="projects" />;
}
