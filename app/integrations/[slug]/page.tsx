import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingDetailPage } from "@/components/site/marketing/detail-page";
import { MATURITY_LABEL } from "@/lib/integration-guides";
import { integrationBySlug, integrationDetails } from "@/lib/marketing-content";
import { makeMetadata } from "@/lib/seo";

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
  const maturity = entry.maturity ? MATURITY_LABEL[entry.maturity] : null;
  const title = maturity
    ? `${entry.title} integration (${maturity})`
    : `${entry.title} integration`;
  const description = entry.realPath
    ? `${entry.description} ${maturity ? `[${maturity}] ` : ""}${entry.realPath}`
    : entry.description;
  return makeMetadata({
    title,
    description: description.slice(0, 160),
    canonicalPath: `/integrations/${entry.slug}`
  });
}

export default async function IntegrationDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = integrationBySlug[slug];
  if (!entry) notFound();

  return (
    <MarketingDetailPage
      sectionLabel="Integrations"
      sectionHref="/integrations"
      entry={entry}
    />
  );
}
