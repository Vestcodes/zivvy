/** @type {import('next').NextConfig} */
const FRAPPE_ORIGIN = process.env.NEXT_PUBLIC_FRAPPE_ORIGIN || "https://zivvy.xyz";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${FRAPPE_ORIGIN}/api/:path*` },
      { source: "/method/:path*", destination: `${FRAPPE_ORIGIN}/method/:path*` },
      { source: "/assets/:path*", destination: `${FRAPPE_ORIGIN}/assets/:path*` },
      { source: "/files/:path*", destination: `${FRAPPE_ORIGIN}/files/:path*` },
      { source: "/private/files/:path*", destination: `${FRAPPE_ORIGIN}/private/files/:path*` },
      { source: "/socket.io/:path*", destination: `${FRAPPE_ORIGIN}/socket.io/:path*` },
      { source: "/app/:path*", destination: `${FRAPPE_ORIGIN}/app/:path*` },
      { source: "/desk/:path*", destination: `${FRAPPE_ORIGIN}/desk/:path*` }
    ];
  }
};

export default nextConfig;
