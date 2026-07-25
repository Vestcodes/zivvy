import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AddonDetailPage } from "@/components/site/marketing/addon-detail";
import { addonBySlug, addonDetails } from "@/lib/addons-content";
import { makeMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return addonDetails.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = addonBySlug[slug];
  if (!entry) return {};
  return makeMetadata({
    title: `${entry.name} add-on`,
    description: entry.metaDescription,
    canonicalPath: `/addons/${entry.slug}`
  });
}

export default async function AddonSlugPage({ params }: Props) {
  const { slug } = await params;
  const entry = addonBySlug[slug];
  if (!entry) notFound();

  // Server-side login check — mirrors the pattern in lib/boot-server.ts.
  // If a Frappe session cookie is present, the detail page will render
  // the in-workspace Subscribe form; otherwise only the dashboard CTA.
  const cookieStore = await cookies();
  const loggedIn = Boolean(cookieStore.get("sid")?.value);

  return <AddonDetailPage addon={entry} loggedIn={loggedIn} />;
}
