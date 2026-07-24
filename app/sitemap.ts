import type { MetadataRoute } from "next";
import {
  alternativeDetails,
  compareDetails,
  featureDetails,
  industryDetails,
  integrationDetails,
  solutionDetails,
  useCaseDetails
} from "@/lib/marketing-content";
import { getAllBlogPosts } from "@/lib/blog";

const BASE = "https://zivvy.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/product-tour`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/solutions`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/alternatives`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/industries`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/use-cases`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/integrations`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/security`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/resources`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/acceptable-use`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/refunds`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/dpa`, lastModified: now, changeFrequency: "yearly", priority: 0.3 }
  ];

  const marketingRoutes: MetadataRoute.Sitemap = [
    ...featureDetails.map((item) => ({
      url: `${BASE}/features/${item.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7
    })),
    ...solutionDetails.map((item) => ({
      url: `${BASE}/solutions/${item.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7
    })),
    ...useCaseDetails.map((item) => ({
      url: `${BASE}/use-cases/${item.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65
    })),
    ...industryDetails.map((item) => ({
      url: `${BASE}/industries/${item.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65
    })),
    ...integrationDetails.map((item) => ({
      url: `${BASE}/integrations/${item.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.55
    })),
    ...compareDetails.map((item) => ({
      url: `${BASE}/compare/${item.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75
    })),
    ...alternativeDetails.map((item) => ({
      url: `${BASE}/alternatives/${item.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75
    }))
  ];

  const blogRoutes: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.65
  }));

  return [...staticRoutes, ...marketingRoutes, ...blogRoutes];
}
