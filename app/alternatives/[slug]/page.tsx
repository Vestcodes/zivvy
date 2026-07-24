import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlternativeDetailPage } from "@/components/site/marketing/alternative-page";
import { alternativeBySlug, alternativeDetails } from "@/lib/marketing-content";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return alternativeDetails.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = alternativeBySlug[slug];
  if (!entry) return {};
  return {
    title: `${entry.title} — Zivvy`,
    description: entry.description,
    alternates: { canonical: `/alternatives/${entry.slug}` }
  };
}

export default async function AlternativeDetailRoutePage({ params }: Props) {
  const { slug } = await params;
  const entry = alternativeBySlug[slug];
  if (!entry) notFound();

  return <AlternativeDetailPage sectionLabel="Alternatives" sectionHref="/alternatives" entry={entry} />;
}
