import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PricingPreview } from "@/components/site/pricing-preview";
import { PricingFaq } from "@/components/site/pricing-faq";
import { PricingCompare } from "@/components/site/pricing-compare";

export const metadata: Metadata = {
  title: "Pricing — Zivvy",
  description:
    "Simple, seat-based pricing. Free, Pro at $15/seat/mo, Business at $25/seat/mo. Change anytime."
};

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-3xl px-6 pt-20 pb-4 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Pricing that matches your growth
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start on Free. Upgrade the moment a specific feature actually pays for itself.
          </p>
        </section>
        <PricingPreview showIntro={false} />
        <PricingCompare />
        <PricingFaq />
      </main>
      <SiteFooter />
    </>
  );
}
