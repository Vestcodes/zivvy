"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { FlipWords } from "@/components/ui/aceternity";

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "How does seat-based billing work?",
    a: "You pay only for the users you actively use. Add or remove seats anytime — proration is automatic."
  },
  {
    q: "Can I switch plans?",
    a: "Yes. Upgrade or downgrade whenever you like. Feature access updates immediately."
  },
  {
    q: "What happens on Free?",
    a: "You get 2 seats, sales, CRM, and basic stock. Enough to run a small operation. Upgrade when you outgrow it."
  },
  {
    q: "Where is data hosted?",
    a: "Choose India, EU, or US at signup. Your data stays in the region you pick."
  },
  {
    q: "Is there a contract?",
    a: (
      <>
        Monthly or annual (20% off). Cancel any time — no long-term lock-in. See{" "}
        <Link
          href="/terms"
          className="text-primary underline-offset-2 hover:underline"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/refunds"
          className="text-primary underline-offset-2 hover:underline"
        >
          Billing &amp; Refunds
        </Link>
        .
      </>
    )
  },
  {
    q: "How do refunds work?",
    a: (
      <>
        Monthly plans cancel any time — you keep access through the paid period.
        Annual plans are refundable for 30 days. Full policy on{" "}
        <Link
          href="/refunds"
          className="text-primary underline-offset-2 hover:underline"
        >
          Billing &amp; Refunds
        </Link>
        .
      </>
    )
  }
];

/**
 * Pricing FAQ. Section header uses Aceternity `<FlipWords>` to cycle
 * curiosity-framed prompts; the questions themselves render inside a
 * Radix accordion so users can drill into just the ones they care about.
 */
export function PricingFaq() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <div className="text-center">
        <h2 className="flex min-h-[2.5rem] flex-wrap items-center justify-center font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          <FlipWords
            words={["still curious?", "have questions?", "need details?"]}
            className="px-0 font-display font-semibold text-primary"
          />
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          The most-asked questions about seats, plans, and refunds.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-sm">
        <Accordion
          type="single"
          collapsible
          defaultValue="faq-0"
          className="divide-y divide-border/60"
        >
          {FAQ.map((item, idx) => (
            <AccordionItem
              key={item.q}
              value={`faq-${idx}`}
              className="border-b-0 px-5"
            >
              <AccordionTrigger className="text-left text-sm font-semibold">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
