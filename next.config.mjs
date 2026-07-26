/** @type {import('next').NextConfig} */
const FRAPPE_ORIGIN = process.env.NEXT_PUBLIC_FRAPPE_ORIGIN || "https://api.zivvy.xyz";

/**
 * Frappe static bundles live under /assets/{app}/… .
 * App ERP routes also use /assets/* (maintenance, movements, depreciation).
 * Array rewrites are afterFiles (before dynamic routes) and were stealing those
 * pages → nginx 404. Keep Desk asset proxies in beforeFiles for known apps only.
 */
const FRAPPE_ASSET_APPS = [
  "frappe",
  "erpnext",
  "hrms",
  "banking",
  "zivvy_brand",
  "zivvy"
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "radix-ui",
      "@radix-ui/react-icons",
      "motion",
      "cmdk",
    ],
  },
  headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/www", destination: "/", permanent: false },
      { source: "/www/:path*", destination: "/:path*", permanent: false },
      { source: "/settings/billing", destination: "/billing", permanent: false }
    ];
  },
  async rewrites() {
    return {
      beforeFiles: FRAPPE_ASSET_APPS.map((app) => ({
        source: `/assets/${app}/:path*`,
        destination: `${FRAPPE_ORIGIN}/assets/${app}/:path*`
      })),
      afterFiles: [
        { source: "/api/:path*", destination: `${FRAPPE_ORIGIN}/api/:path*` },
        { source: "/method/:path*", destination: `${FRAPPE_ORIGIN}/method/:path*` },
        { source: "/files/:path*", destination: `${FRAPPE_ORIGIN}/files/:path*` },
        {
          source: "/private/files/:path*",
          destination: `${FRAPPE_ORIGIN}/private/files/:path*`
        },
        { source: "/socket.io/:path*", destination: `${FRAPPE_ORIGIN}/socket.io/:path*` },
        { source: "/app/:path*", destination: `${FRAPPE_ORIGIN}/app/:path*` },
        { source: "/desk/:path*", destination: `${FRAPPE_ORIGIN}/desk/:path*` }
      ],
      fallback: []
    };
  }
};

export default nextConfig;
