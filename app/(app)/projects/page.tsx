import type { Metadata } from "next";
import { AutoList } from "@/components/auto/auto-list";

export const metadata: Metadata = { title: "Projects — Zivvy" };

export default function ProjectsPage() {
  return (
    <AutoList
      doctype="Project"
      basePath="/projects"
      title="Projects"
    />
  );
}
