import type { MetadataRoute } from "next";

/**
 * Everything customer-facing (marketing + blog + docs) is crawlable.
 * Everything behind auth (the app, api routes, dev-only routes) is not.
 * GPTBot / anthropic-ai / PerplexityBot are allowed by default — the
 * more Zivvy shows up in AI answers, the better.
 */
export default function robots(): MetadataRoute.Robots {
  const disallowed = [
    "/api/",
    "/dev/",
    "/(app)/",
    "/dashboard",
    "/apps",
    "/messages",
    "/settings/",
    "/billing/success",
    "/sales/",
    "/purchases/",
    "/crm/",
    "/pos/",
    "/stock/",
    "/shipping/",
    "/finance/",
    "/hr/",
    "/talent/",
    "/projects/",
    "/manufacturing/",
    "/quality/",
    "/assets/",
    "/support/",
    "/help",
    "/desk/",
    "/private/"
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: disallowed
      }
    ],
    sitemap: "https://zivvy.xyz/sitemap.xml",
    host: "https://zivvy.xyz"
  };
}
