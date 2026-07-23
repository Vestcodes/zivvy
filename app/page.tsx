import { SiteHeader } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { Features } from "@/components/site/features";
import { SocialProof } from "@/components/site/social-proof";
import { PricingPreview } from "@/components/site/pricing-preview";
import { HomeFaq } from "@/components/site/home-faq";
import { ClosingCta } from "@/components/site/closing-cta";
import { SiteFooter } from "@/components/site/footer";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <SocialProof />
        <PricingPreview />
        <HomeFaq />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
