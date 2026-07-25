import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/seo";

/**
 * Everything customer-facing (marketing + blog + docs) is crawlable.
 * Auth-only areas (API, dev tools, settings, the app shell) are blocked.
 * GPTBot / anthropic-ai / PerplexityBot are allowed by default — the
 * more Zivvy shows up in AI answers, the better.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dev/", "/settings/", "/(app)/"]
      }
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`
  };
}
