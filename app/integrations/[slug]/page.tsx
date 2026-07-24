import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingDetailPage } from "@/components/site/marketing/detail-page";
import { integrationBySlug, integrationDetails } from "@/lib/marketing-content";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return integrationDetails.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = integrationBySlug[slug];
  if (!entry) return {};
  return {
    title: `${entry.title} — Zivvy`,
    description: entry.description,
    alternates: { canonical: `/integrations/${entry.slug}` }
  };
}

export default async function IntegrationDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = integrationBySlug[slug];
  if (!entry) notFound();

  return <MarketingDetailPage sectionLabel="Integrations" sectionHref="/integrations" entry={entry} />;
}
