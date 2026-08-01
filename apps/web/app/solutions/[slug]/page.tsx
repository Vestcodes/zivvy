import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SolutionDetailPage } from "@/components/site/marketing/solution-detail-page";
import {
  solutionProfileBySlug,
  solutionProfiles
} from "@/lib/solutions-content";
import { makeMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return solutionProfiles.map((profile) => ({ slug: profile.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = solutionProfileBySlug[slug];
  if (!profile) return {};

  const metadata = makeMetadata({
    title: profile.title,
    description: profile.description,
    canonicalPath: `/solutions/${profile.slug}`,
    ogImage: profile.ogImage
  });

  // Country pages with a secondary locale get an alternate hreflang link.
  if (profile.type === "country" && profile.secondaryLocale) {
    metadata.alternates = {
      canonical: `https://zivvy.xyz/solutions/${profile.slug}`,
      languages: {
        [profile.primaryLanguage]: `https://zivvy.xyz/solutions/${profile.slug}`,
        [profile.secondaryLocale]: `https://zivvy.xyz/solutions/${profile.slug}`
      }
    };
  }

  // Country pages influence openGraph.locale.
  if (profile.type === "country" && metadata.openGraph) {
    metadata.openGraph = {
      ...metadata.openGraph,
      locale: profile.primaryLanguage.replace("-", "_")
    };
  }

  return metadata;
}

export default async function SolutionSlugPage({ params }: Props) {
  const { slug } = await params;
  const profile = solutionProfileBySlug[slug];
  if (!profile) notFound();

  return <SolutionDetailPage profile={profile} />;
}
