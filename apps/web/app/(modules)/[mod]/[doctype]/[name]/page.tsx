import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AutoForm } from "@/components/auto/auto-form";
import { slugToDoctype } from "@/lib/doctype-slugs";

interface Props {
  params: Promise<{ mod: string; doctype: string; name: string }>;
}

function humanize(seg: string): string {
  return seg
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { doctype, name } = await params;
  const title = name === "new" ? `New ${humanize(doctype).replace(/s$/, "")}` : name;
  return { title: `${title} — Zivvy` };
}

export default async function ModuleDoctypeFormPage({ params }: Props) {
  const { mod, doctype: docSlug, name } = await params;
  const dt = slugToDoctype(mod, docSlug);
  if (!dt) notFound();

  return (
    <AutoForm
      doctype={dt}
      name={decodeURIComponent(name)}
      basePath={`/${mod}/${docSlug}`}
      title={humanize(docSlug)}
    />
  );
}
