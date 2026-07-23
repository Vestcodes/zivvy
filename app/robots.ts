import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/api/", "/private/", "/desk/"]
      }
    ],
    sitemap: "https://zivvy.xyz/sitemap.xml",
    host: "https://zivvy.xyz"
  };
}
