"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  CreditCard,
  FileSignature,
  PlugZap,
  ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";

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

/**
 * Add-ons grid using the Aceternity card-hover-effect pattern: a single
 * shared `layoutId` moves a soft highlight to the hovered card, and the
 * non-hovered siblings fade back slightly. Every card is a `<Link>` to the
 * matching /addons detail page.
 */
export function PricingAddons() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      id="add-ons"
      className="mx-auto max-w-6xl px-6 pb-4 pt-6 sm:pt-10"
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
          Bolt on the exact capability you need. Metered per workspace — turn
          off when you don&apos;t.
        </p>
      </div>

      <div
        className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
        onMouseLeave={() => setHovered(null)}
      >
        {PRICING_ADDONS.map((addon, idx) => {
          const isDimmed = hovered !== null && hovered !== idx;
          return (
            <Link
              key={addon.slug}
              href={`/addons/${addon.slug}`}
              onMouseEnter={() => setHovered(idx)}
              className={cn(
                "group relative block h-full rounded-2xl p-2 transition-opacity duration-200",
                isDimmed && "opacity-60"
              )}
            >
              <AnimatePresence>
                {hovered === idx && (
                  <motion.span
                    layoutId="addon-hover-bg"
                    className="absolute inset-0 -z-10 rounded-2xl bg-primary/[0.08] dark:bg-primary/[0.14]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.15 } }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.2, delay: 0.05 }
                    }}
                  />
                )}
              </AnimatePresence>

              <div
                className={cn(
                  "relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border/70 bg-card/70 p-5",
                  "transition-all duration-[var(--duration-base)]",
                  "group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-elevation-md"
                )}
              >
                <div>
                  <div className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-primary">
                    <addon.Icon className="size-4" />
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-bold tabular-nums leading-none">
                      ${addon.priceMonthly}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / workspace / mo
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-base font-semibold tracking-tight">
                    {addon.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {addon.description}
                  </p>
                </div>

                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Learn more
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Add-ons stack on Pro and Business plans.
      </p>
    </section>
  );
}
