import type { Metadata } from "next";
import { CareersPageContent } from "@/components/site/marketing/careers-page";

export const metadata: Metadata = {
  title: "Careers — Zivvy",
  description: "Explore career opportunities at Zivvy and help build the future of operational software."
};

export default function CareersPage() {
  return <CareersPageContent />;
}
