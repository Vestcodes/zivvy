import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingDetailPage } from "@/components/site/marketing/detail-page";
import { featureBySlug, featureDetails } from "@/lib/marketing-content";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return featureDetails.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = featureBySlug[slug];
  if (!entry) {
    return {};
  }
  return {
    title: `${entry.title} — Zivvy`,
    description: entry.description,
    alternates: { canonical: `/features/${entry.slug}` }
  };
}

export default async function FeatureDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = featureBySlug[slug];
  if (!entry) notFound();

  return <MarketingDetailPage sectionLabel="Features" sectionHref="/features" entry={entry} />;
}
