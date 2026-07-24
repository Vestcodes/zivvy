import type { Metadata } from "next";
import { AboutPageContent } from "@/components/site/marketing/about-page";

export const metadata: Metadata = {
  title: "About — Zivvy",
  description:
    "Learn Zivvy's mission, story, values, and operating principles for building practical business software."
};

export default function AboutPage() {
  return <AboutPageContent />;
}
