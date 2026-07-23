import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { BootProvider } from "@/components/boot-provider";
import { QueryProvider } from "@/components/query-provider";
import { fetchBootinfo } from "@/lib/boot-server";
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

export const metadata: Metadata = {
  title: "Zivvy — business software on an open ERP core",
  description:
    "Zivvy by Vestcodes: sales, stock, accounting, HR and manufacturing in one clean product on top of an open ERP core.",
  metadataBase: new URL("https://zivvy.xyz"),
  openGraph: {
    title: "Zivvy",
    description: "Business software on an open ERP core.",
    url: "https://zivvy.xyz",
    siteName: "Zivvy"
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const bootinfo = await fetchBootinfo();
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        <QueryProvider>
          <BootProvider bootinfo={bootinfo}>
            {children}
            <Toaster position="top-center" />
          </BootProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
