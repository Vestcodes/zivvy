import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AutoList } from "@/components/auto/auto-list";
import { slugToDoctype } from "@/lib/doctype-slugs";

interface Props {
  params: Promise<{ mod: string; doctype: string }>;
  searchParams: Promise<{ q?: string; page?: string; size?: string; filters?: string; sort?: string; order?: string }>;
}

function humanize(seg: string): string {
  return seg
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { doctype } = await params;
  return { title: `${humanize(doctype)} — Zivvy` };
}

export default async function ModuleDoctypeListPage({ params, searchParams }: Props) {
  const { mod, doctype: docSlug } = await params;
  const sp = await searchParams;
  const dt = slugToDoctype(mod, docSlug);
  if (!dt) notFound();

  return (
    <AutoList
      doctype={dt}
      basePath={`/${mod}/${docSlug}`}
      title={humanize(docSlug)}
      searchParams={sp}
    />
  );
}
