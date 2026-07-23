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
    q: "Is this built on ERPNext?",
    a: "Yes — under the hood is a Frappe/ERPNext core. Zivvy adds a modern frontend, a working billing layer, and sane defaults so you never touch the old desk UI unless you want to."
  },
  {
    q: "How is Zivvy different from Odoo?",
    a: "Zivvy is open-core, seat-based, and has no forced modules. Sales, stock, HR, accounting, and manufacturing all live in one product with pricing that doesn't punish growth."
  },
  {
    q: "Can I bring my own hosting?",
    a: "Business plan customers can self-host or run on their own cloud. We provide the container image, migration scripts, and support for the first 30 days."
  },
  {
    q: "Can we import from another ERP?",
    a: "Yes — CSV import for masters, transactions, and stock levels. For larger migrations from Odoo, SAP B1, Zoho, or Tally, our team runs the mapping for you on Pro and Business."
  },
  {
    q: "What data goes where?",
    a: "Pick India, EU, or US at signup. Your data stays in that region and never crosses borders. GDPR + SOC 2 controls are in place; we're happy to sign a DPA."
  },
  {
    q: "How do refunds work?",
    a: "Monthly plans cancel any time — you pay only for what you used. Annual plans are refundable for 30 days, no questions asked. After that, we prorate on downgrades."
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
