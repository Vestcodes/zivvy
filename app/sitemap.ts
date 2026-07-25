import type { MetadataRoute } from "next";
import {
  alternativeDetails,
  compareDetails,
  featureDetails,
  industryDetails,
  integrationDetails,
  useCaseDetails
} from "@/lib/marketing-content";
import { solutionProfiles } from "@/lib/solutions-content";
import { getAllBlogPosts } from "@/lib/blog";
import { SITE_ORIGIN } from "@/lib/seo";

const BASE = SITE_ORIGIN;

/**
 * Slugs for the /addons subtree. These are fixed marketing pages that live
 * outside the details arrays because they are shipped as standalone routes.
 */
const ADDON_SLUGS = [
  "ecommerce-integrations",
  "erpnext-datev",
  "digital-signer",
  "payments-processor"
] as const;

type Entry = MetadataRoute.Sitemap[number];

function entry(
  path: string,
  priority: number,
  changeFrequency: Entry["changeFrequency"] = "monthly",
  lastModified: Date = new Date()
): Entry {
  return {
    url: `${BASE}${path}`,
    lastModified,
    changeFrequency,
    priority
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Home
  const home: Entry[] = [entry("/", 1.0, "monthly", now)];

  // Primary marketing routes.
  const primary: Entry[] = [
    entry("/pricing", 0.9, "monthly", now),
    entry("/product-tour", 0.9, "monthly", now),
    entry("/about", 0.9, "monthly", now),
    entry("/security", 0.9, "monthly", now),
    entry("/contact", 0.9, "monthly", now),
    entry("/careers", 0.9, "monthly", now)
  ];

  // Hubs + their detail pages.
  const features: Entry[] = [
    entry("/features", 0.8, "monthly", now),
    ...featureDetails.map((item) => entry(`/features/${item.slug}`, 0.8, "monthly", now))
  ];

  const solutions: Entry[] = [
    entry("/solutions", 0.8, "monthly", now),
    ...solutionProfiles.map((item) => entry(`/solutions/${item.slug}`, 0.8, "monthly", now))
  ];

  const industries: Entry[] = [
    entry("/industries", 0.8, "monthly", now),
    ...industryDetails.map((item) => entry(`/industries/${item.slug}`, 0.8, "monthly", now))
  ];

  const useCases: Entry[] = [
    entry("/use-cases", 0.7, "monthly", now),
    ...useCaseDetails.map((item) => entry(`/use-cases/${item.slug}`, 0.7, "monthly", now))
  ];

  const integrations: Entry[] = [
    entry("/integrations", 0.9, "monthly", now),
    ...integrationDetails.map((item) => entry(`/integrations/${item.slug}`, 0.9, "monthly", now))
  ];

  const alternatives: Entry[] = [
    entry("/alternatives", 0.6, "monthly", now),
    ...alternativeDetails.map((item) => entry(`/alternatives/${item.slug}`, 0.6, "monthly", now))
  ];

  const compare: Entry[] = [
    entry("/compare", 0.6, "monthly", now),
    ...compareDetails.map((item) => entry(`/compare/${item.slug}`, 0.6, "monthly", now))
  ];

  const addons: Entry[] = [
    entry("/addons", 0.8, "monthly", now),
    ...ADDON_SLUGS.map((slug) => entry(`/addons/${slug}`, 0.8, "monthly", now))
  ];

  // Legal / policy routes — infrequently updated.
  const legal: Entry[] = [
    entry("/privacy", 0.3, "yearly", now),
    entry("/terms", 0.3, "yearly", now),
    entry("/dpa", 0.3, "yearly", now),
    entry("/cookies", 0.3, "yearly", now),
    entry("/refunds", 0.3, "yearly", now),
    entry("/acceptable-use", 0.3, "yearly", now)
  ];

  // Blog — kept from prior implementation. Each post lands on its own URL.
  const blog: Entry[] = [
    entry("/blog", 0.8, "weekly", now),
    ...getAllBlogPosts().map((post) =>
      entry(`/blog/${post.slug}`, 0.65, "monthly", new Date(post.publishedAt))
    )
  ];

  return [
    ...home,
    ...primary,
    ...features,
    ...solutions,
    ...industries,
    ...useCases,
    ...integrations,
    ...alternatives,
    ...compare,
    ...addons,
    ...legal,
    ...blog
  ];
}
