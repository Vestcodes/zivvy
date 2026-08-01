import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingDetailPage } from "@/components/site/marketing/detail-page";
import { useCaseBySlug, useCaseDetails } from "@/lib/marketing-content";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return useCaseDetails.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = useCaseBySlug[slug];
  if (!entry) return {};
  return {
    title: `${entry.title} — Zivvy`,
    description: entry.description,
    alternates: { canonical: `/use-cases/${entry.slug}` }
  };
}

export default async function UseCaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = useCaseBySlug[slug];
  if (!entry) notFound();

  return <MarketingDetailPage sectionLabel="Use cases" sectionHref="/use-cases" entry={entry} />;
}
