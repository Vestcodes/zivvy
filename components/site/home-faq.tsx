import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

const FAQ = [
  {
    q: "How is Zivvy different from Odoo or Zoho?",
    a: "Zivvy is seat-based with no forced modules. Sales, stock, HR, accounting, and manufacturing live in one clean product. Pricing does not punish growth."
  },
  {
    q: "Can I bring my own hosting?",
    a: "Business customers can self-host or run on their own cloud. Pro and Business include priority support. Business also includes migration help for the first 30 days."
  },
  {
    q: "Can we import from another ERP?",
    a: "Yes — CSV import for masters, transactions, and stock. Larger migrations from Odoo, SAP B1, Zoho, or Tally get mapping help on Pro and Business."
  },
  {
    q: "What data goes where?",
    a: (
      <>
        Pick India, EU, or US at signup. Your data stays in that region.
        We can sign a DPA — see the{" "}
        <Link href="/dpa" className="text-primary underline-offset-2 hover:underline">
          DPA summary
        </Link>
        .
      </>
    )
  },
  {
    q: "How do refunds work?",
    a: (
      <>
        Monthly plans cancel any time. Annual plans are refundable for 30 days.
        After that, we prorate on downgrades. Details:{" "}
        <Link href="/refunds" className="text-primary underline-offset-2 hover:underline">
          Billing &amp; Refunds
        </Link>
        .
      </>
    )
  }
];

export function HomeFaq() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Questions people actually ask
          </h2>
          <p className="mt-3 text-muted-foreground">
            Still not sure? <Link href="/contact" className="text-primary underline-offset-2 hover:underline">Ping us</Link> — a human replies, usually within the hour.
          </p>
        </div>
      </Reveal>
      <Reveal delay={80}>
        <Accordion type="single" collapsible className="mt-10 rounded-xl border border-border/70 bg-card/60 px-2 shadow-sm">
          {FAQ.map((item) => (
            <AccordionItem key={item.q} value={item.q} className="border-border/60 last:border-b-0">
              <AccordionTrigger className="px-4 text-left text-sm font-medium">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="px-4 text-sm text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
