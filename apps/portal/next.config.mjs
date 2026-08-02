/** @type {import('next').NextConfig} */
const FRAPPE_ORIGIN = process.env.NEXT_PUBLIC_FRAPPE_ORIGIN || "https://api.zivvy.xyz";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async rewrites() {
    return {
      afterFiles: [
        { source: "/api/:path*", destination: `${FRAPPE_ORIGIN}/api/:path*` },
        { source: "/method/:path*", destination: `${FRAPPE_ORIGIN}/method/:path*` },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
