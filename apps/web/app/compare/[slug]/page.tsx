import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompareDetailPage } from "@/components/site/marketing/compare-page";
import { compareBySlug, compareDetails } from "@/lib/marketing-content";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return compareDetails.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = compareBySlug[slug];
  if (!entry) return {};
  return {
    title: `${entry.title} — Zivvy`,
    description: entry.description,
    alternates: { canonical: `/compare/${entry.slug}` }
  };
}

export default async function CompareDetailRoutePage({ params }: Props) {
  const { slug } = await params;
  const entry = compareBySlug[slug];
  if (!entry) notFound();

  return <CompareDetailPage sectionLabel="Compare" sectionHref="/compare" entry={entry} />;
}
