import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PricingHero } from "@/components/site/marketing/pricing-hero";
import { PricingPreview } from "@/components/site/pricing-preview";
import { PricingFaq } from "@/components/site/pricing-faq";
import { PricingCompare } from "@/components/site/pricing-compare";
import { PricingAddons } from "@/components/site/pricing-addons";
import { PricingBillingProvider } from "@/components/site/pricing-billing-provider";
import { FaqJsonLd, ProductJsonLd } from "@/components/site/marketing/seo-scripts";
import { makeMetadata } from "@/lib/seo";

export const metadata = makeMetadata({
  title: "Pricing",
  description:
    "Simple, seat-based pricing. Free forever, Pro at $18/seat/mo, Business at $30/seat/mo. Annual saves 20%. Add-ons for ecommerce, DATEV, digital signing and payments.",
  canonicalPath: "/pricing"
});

/**
 * Machine-readable FAQ payload for LLM answer engines. Kept intentionally
 * short (4 items) — long FAQPage schemas get down-weighted or ignored.
 * The visible FAQ can carry more items; this is the schema.org contract.
 */
const PRICING_FAQ_LD = [
  {
    question: "How does seat-based billing work?",
    answer:
      "You pay only for the users you actively use. Add or remove seats anytime — proration is automatic on the next invoice."
  },
  {
    question: "Can I switch plans?",
    answer:
      "Yes. Upgrade or downgrade at any time. Feature access updates immediately and billing prorates on your next cycle."
  },
  {
    question: "Are add-ons included in Pro or Business?",
    answer:
      "No. Add-ons like ecommerce sync, DATEV export, digital signing and payments are billed per workspace per month and stack on top of any paid seat plan."
  },
  {
    question: "How do refunds work?",
    answer:
      "Monthly plans cancel any time — you keep access through the paid period. Annual plans are refundable for 30 days from purchase."
  }
];

export default function PricingPage() {
  return (
    <>
      <ProductJsonLd
        name="Zivvy Free"
        description="Free forever plan — 2 seats, sales, CRM and basic stock."
        priceUsd={0}
      />
      <ProductJsonLd
        name="Zivvy Pro"
        description="Per seat, per month. Full accounting, stock, HR and projects."
        priceUsd={18}
      />
      <ProductJsonLd
        name="Zivvy Business"
        description="Per seat, per month. Everything in Pro plus manufacturing, assets, subcontracting and multi-company."
        priceUsd={30}
      />
      <FaqJsonLd faqs={PRICING_FAQ_LD} />
      <SiteHeader />
      <main>
        <PricingBillingProvider>
          <PricingHero />
          <PricingPreview showIntro={false} />
        </PricingBillingProvider>
        <PricingCompare />
        <PricingAddons />
        <PricingFaq />
      </main>
      <SiteFooter />
    </>
  );
}
