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
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*" },
      { protocol: "http", hostname: "*" },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "radix-ui",
      "@radix-ui/react-icons",
      "@tanstack/react-query",
      "motion",
      "cmdk",
    ],
  },
  headers() {
    return [
      {
        // Security headers — apply to every route
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https: wss:",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Strip infrastructure identification headers
          { key: "X-Powered-By", value: "" },
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
