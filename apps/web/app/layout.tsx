import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { BootProvider } from "@/components/boot-provider";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { RegionProvider } from "@/components/pricing/region-provider";
import { GUEST_BOOT } from "@/lib/boot-types";
import {
  OrganizationJsonLd,
  SoftwareApplicationJsonLd,
  WebSiteJsonLd
} from "@/components/site/marketing/seo-scripts";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PostHogProvider } from "@/components/posthog-provider";
import { SITE_ORIGIN } from "@/lib/seo";
import "./globals.css";

// Inter drives both --font-sans and --font-serif (Inter's Display cut covers
// both use-cases). Invoked twice so each CSS variable resolves independently.
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-inter-sans",
  display: "swap"
});

const fontSerif = Inter({
  subsets: ["latin"],
  variable: "--font-inter-serif",
  display: "swap"
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap"
});

const TITLE = "Zivvy — the clean way to run your whole business";
const DESCRIPTION =
  "Sales, stock, accounting, HR and manufacturing in one product built for founder-led teams. Seat-based pricing, region-picked data, no forced modules.";
const ENABLE_VERCEL_ANALYTICS =
  process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "true";
const ENABLE_VERCEL_SPEED_INSIGHTS =
  process.env.NEXT_PUBLIC_ENABLE_VERCEL_SPEED_INSIGHTS === "true";

export const metadata: Metadata = {
  title: {
    default: TITLE,
    template: "%s"
  },
  description: DESCRIPTION,
  metadataBase: new URL(SITE_ORIGIN),
  applicationName: "Zivvy",
  keywords: [
    "ERP software",
    "business software",
    "Odoo alternative",
    "small business ERP",
    "accounting software",
    "inventory management",
    "HR software",
    "manufacturing ERP",
    "SaaS ERP",
    "modern ERP",
    "Zivvy"
  ],
  authors: [{ name: "Vestcodes", url: "https://zivvy.xyz" }],
  creator: "Vestcodes",
  publisher: "Vestcodes",
  category: "Business Software",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/blog/rss.xml", title: "Zivvy Blog" }]
    }
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }]
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_ORIGIN,
    siteName: "Zivvy",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Zivvy — the clean way to run your whole business"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  },
  verification: {
    // Populate when Google Search Console / Bing verify tokens are set.
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#05080f" }
  ],
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <SoftwareApplicationJsonLd />
        <PostHogProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <QueryProvider>
              <BootProvider bootinfo={GUEST_BOOT}>
                <RegionProvider>
                  {children}
                  <Toaster position="top-center" />
                </RegionProvider>
              </BootProvider>
            </QueryProvider>
          </ThemeProvider>
        </PostHogProvider>
        {ENABLE_VERCEL_ANALYTICS ? <Analytics /> : null}
        {ENABLE_VERCEL_SPEED_INSIGHTS ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
