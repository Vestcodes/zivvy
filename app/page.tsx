import { SiteHeader } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { Features } from "@/components/site/features";
import { HowItWorks } from "@/components/site/how-it-works";
import { IntegrationsStrip } from "@/components/site/integrations-strip";
import { SocialProof } from "@/components/site/social-proof";
import { PricingPreview } from "@/components/site/pricing-preview";
import { HomeFaq } from "@/components/site/home-faq";
import { ClosingCta } from "@/components/site/closing-cta";
import { SiteFooter } from "@/components/site/footer";
import { FaqPageJsonLd } from "@/components/seo/json-ld";

const HOME_FAQ_LD = [
  {
    question: "How is Zivvy different from Odoo or Zoho?",
    answer:
      "Zivvy is seat-based with no forced modules. Sales, stock, HR, accounting, and manufacturing live in one clean product. Pricing does not punish growth."
  },
  {
    question: "Can I bring my own hosting?",
    answer:
      "Business customers can self-host or run on their own cloud. Pro and Business include priority support. Business also includes migration help for the first 30 days."
  },
  {
    question: "Can we import from another ERP?",
    answer:
      "Yes. CSV import for masters, transactions, and stock. Larger migrations from Odoo, SAP B1, Zoho, or Tally get mapping help on Pro and Business."
  },
  {
    question: "What data goes where?",
    answer:
      "Pick India, EU, or US at signup. Your data stays in that region. Zivvy signs a DPA on request."
  },
  {
    question: "How do refunds work?",
    answer:
      "Monthly plans cancel any time. Annual plans are refundable for 30 days. After that we prorate on downgrades."
  }
];

export default function HomePage() {
  return (
    <>
      <FaqPageJsonLd faqs={HOME_FAQ_LD} />
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <IntegrationsStrip />
        <SocialProof />
        <PricingPreview />
        <HomeFaq />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
