import type { Metadata } from "next";
import { AutoList } from "@/components/auto/auto-list";

export const metadata: Metadata = { title: "Assets — Zivvy" };

export default function AssetsPage() {
  return (
    <AutoList
      doctype="Asset"
      basePath="/assets"
      title="Assets"
    />
  );
}
