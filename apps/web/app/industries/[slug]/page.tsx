import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingDetailPage } from "@/components/site/marketing/detail-page";
import { industryBySlug, industryDetails } from "@/lib/marketing-content";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return industryDetails.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = industryBySlug[slug];
  if (!entry) return {};
  return {
    title: `${entry.title} — Zivvy`,
    description: entry.description,
    alternates: { canonical: `/industries/${entry.slug}` }
  };
}

export default async function IndustryDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = industryBySlug[slug];
  if (!entry) notFound();

  return <MarketingDetailPage sectionLabel="Industries" sectionHref="/industries" entry={entry} />;
}
