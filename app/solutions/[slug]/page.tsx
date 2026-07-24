import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SolutionsDetailPage } from "@/components/site/marketing/solutions-detail";
import { solutionBySlug, solutionDetails } from "@/lib/marketing-content";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return solutionDetails.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = solutionBySlug[slug];
  if (!entry) return {};
  return {
    title: `${entry.title} — Zivvy`,
    description: entry.description,
    alternates: { canonical: `/solutions/${entry.slug}` }
  };
}

export default async function SolutionDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = solutionBySlug[slug];
  if (!entry) notFound();

  return <SolutionsDetailPage entry={entry} />;
}
