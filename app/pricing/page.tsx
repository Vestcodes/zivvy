import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PricingHero } from "@/components/site/marketing/pricing-hero";
import { PricingPreview } from "@/components/site/pricing-preview";
import { PricingFaq } from "@/components/site/pricing-faq";
import { PricingCompare } from "@/components/site/pricing-compare";

export const metadata: Metadata = {
  title: "Pricing — Zivvy",
  description:
    "Simple, seat-based pricing. Free, Pro at $18/seat/mo, Business at $30/seat/mo. Annual saves 20%. Change anytime."
};

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PricingHero />
        <PricingPreview showIntro={false} />
        <PricingCompare />
        <PricingFaq />
      </main>
      <SiteFooter />
    </>
  );
}
