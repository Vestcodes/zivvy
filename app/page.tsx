import { SiteHeader } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { Features } from "@/components/site/features";
import { PricingPreview } from "@/components/site/pricing-preview";
import { SiteFooter } from "@/components/site/footer";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <PricingPreview />
      </main>
      <SiteFooter />
    </>
  );
}
