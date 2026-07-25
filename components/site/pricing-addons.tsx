import Link from "next/link";
import { ArrowUpRight, CreditCard, FileSignature, PlugZap, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Zivvy add-ons — optional metered features that layer onto Pro and Business
 * plans. Each row here maps 1:1 to a marketing detail page under /addons.
 */
export interface AddonEntry {
  slug: string;
  name: string;
  priceMonthly: number;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export const PRICING_ADDONS: AddonEntry[] = [
  {
    slug: "ecommerce-integrations",
    name: "Ecommerce integrations",
    priceMonthly: 29,
    description:
      "Sync orders, inventory and customers with Shopify, WooCommerce and Amazon.",
    Icon: ShoppingBag
  },
  {
    slug: "erpnext-datev",
    name: "DATEV export",
    priceMonthly: 19,
    description:
      "German-standard DATEV exports for accountants — chart of accounts, journals, VAT.",
    Icon: FileSignature
  },
  {
    slug: "digital-signer",
    name: "Digital signer",
    priceMonthly: 15,
    description:
      "Sign quotes, contracts and delivery notes in-app. eIDAS-compliant audit trail.",
    Icon: PlugZap
  },
  {
    slug: "payments-processor",
    name: "Payments processor",
    priceMonthly: 25,
    description:
      "Accept card, SEPA and UPI directly on invoices with automatic reconciliation.",
    Icon: CreditCard
  }
];

export function PricingAddons() {
  return (
    <section
      id="add-ons"
      className="mx-auto max-w-6xl px-6 pb-4 pt-2 sm:pt-4"
      aria-labelledby="pricing-addons-heading"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2
          id="pricing-addons-heading"
          className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Add-ons
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Bolt on the exact capability you need. Metered per workspace — turn off when
          you don&apos;t.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PRICING_ADDONS.map((addon) => (
          <Card
            key={addon.slug}
            className="group relative flex h-full flex-col border-border/70 bg-card/60 transition-all duration-[var(--duration-base)] hover:-translate-y-0.5 hover:shadow-elevation-md"
          >
            <CardHeader>
              <div className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-primary">
                <addon.Icon className="size-4" />
              </div>
              <CardTitle className="mt-3 font-display text-lg">{addon.name}</CardTitle>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold tabular-nums">
                  ${addon.priceMonthly}
                </span>
                <span className="text-xs text-muted-foreground">/ workspace / month</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-4">
              <CardDescription className="text-sm">{addon.description}</CardDescription>
              <Link
                href={`/addons/${addon.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Learn more
                <ArrowUpRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Add-ons stack on Pro and Business plans.
      </p>
    </section>
  );
}
