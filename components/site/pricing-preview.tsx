"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import {
  WobbleCard,
  GlowingEffect,
  MovingBorderButton
} from "@/components/ui/aceternity";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { usePricingBilling } from "@/components/site/pricing-billing-provider";
import { cn } from "@/lib/utils";

type Plan = {
  slug: "free" | "pro" | "business";
  name: string;
  monthly: number;
  annual: number; // per-seat, per-month, when billed annually
  desc: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

const PLANS: Plan[] = [
  {
    slug: "free",
    name: "Free",
    monthly: 0,
    annual: 0,
    desc: "Get started with sales, stock basics, and CRM.",
    features: ["2 seats", "Sales & CRM", "Basic stock", "Community support"],
    cta: "Get started"
  },
  {
    slug: "pro",
    name: "Pro",
    monthly: 18,
    annual: 14,
    desc: "Full accounting, stock, HR, and projects.",
    features: [
      "Accounting & tax",
      "Full stock & warehouses",
      "HR & payroll",
      "Barcode workflows",
      "Priority support"
    ],
    cta: "Try Pro",
    highlighted: true
  },
  {
    slug: "business",
    name: "Business",
    monthly: 30,
    annual: 24,
    desc: "Everything, plus manufacturing, assets, and multi-company.",
    features: [
      "Everything in Pro",
      "Manufacturing & BOMs",
      "Assets & quality",
      "Subcontracting",
      "Multi-company controls"
    ],
    cta: "Start Business"
  }
];

interface Props {
  showIntro?: boolean;
  className?: string;
}

/**
 * Tier cards for /pricing. The billing cycle comes from
 * `<PricingBillingProvider>` (toggle lives in the hero). Cards render as
 * Aceternity `<WobbleCard>` for the parallax-on-hover feel; the featured
 * Pro card gets a `<GlowingEffect>` border sweep plus a subtle scale. All
 * three CTAs are `<MovingBorderButton>`s so the primary action reads as
 * "clickable" everywhere.
 */
export function PricingPreview({ showIntro = true, className }: Props = {}) {
  const { billing } = usePricingBilling();

  return (
    <section
      className={cn("mx-auto max-w-6xl px-6 pb-16 pt-8 sm:pb-24", className)}
    >
      {showIntro && (
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Pricing that matches your growth
          </h2>
          <p className="mt-4 text-muted-foreground">
            Simple, transparent, seat-based. Change or cancel anytime.
          </p>
        </div>
      )}

      <div
        className={cn(
          "grid gap-6 md:gap-5 lg:grid-cols-3 lg:items-stretch",
          showIntro ? "mt-10" : "mt-2"
        )}
      >
        {PLANS.map((plan, i) => {
          const price = billing === "annual" ? plan.annual : plan.monthly;
          const isFree = plan.slug === "free";
          const isFeatured = plan.highlighted;
          const href = `/login?plan=${plan.slug}&billing=${billing}#signup`;

          const container = isFeatured
            ? "relative lg:scale-[1.02] lg:z-10 bg-card/95 dark:bg-card/70 ring-2 ring-primary/40 shadow-elevation-md"
            : "relative bg-card/60 hover:bg-card/80";

          return (
            <Reveal key={plan.slug} delay={i * 80} className="h-full">
              <WobbleCard
                containerClassName={cn(
                  "h-full rounded-2xl border border-border/70 text-foreground",
                  container
                )}
                className="p-6 sm:p-7 flex h-full flex-col"
              >
                {/* GlowingEffect only fires on the featured card. */}
                {isFeatured && (
                  <GlowingEffect
                    disabled={false}
                    glow
                    proximity={80}
                    spread={40}
                    blur={0}
                    borderWidth={2}
                    movementDuration={1.4}
                  />
                )}

                <div className="relative flex items-center justify-between">
                  <h3 className="font-display text-xl font-semibold tracking-tight">
                    {plan.name}
                  </h3>
                  {isFeatured && (
                    <Badge className="border-transparent bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
                      Most popular
                    </Badge>
                  )}
                </div>

                <div className="relative">
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.desc}
                  </p>

                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold tracking-tight tabular-nums">
                      ${price}
                    </span>
                    {!isFree && (
                      <span className="text-sm text-muted-foreground">
                        per seat / month
                      </span>
                    )}
                  </div>
                  {billing === "annual" && !isFree && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      billed as{" "}
                      <span className="font-mono tabular-nums text-foreground">
                        ${plan.annual * 12}
                      </span>
                      /seat/year
                    </p>
                  )}
                </div>

                <ul className="relative mt-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="relative mt-6">
                  <MovingBorderButton
                    as={Link}
                    href={href}
                    duration={isFeatured ? 2400 : 4000}
                    borderRadius="0.75rem"
                    containerClassName="w-full h-11 text-base"
                    borderClassName={cn(
                      "h-16 w-16 opacity-90",
                      isFeatured
                        ? "bg-[radial-gradient(var(--primary)_40%,transparent_60%)]"
                        : "bg-[radial-gradient(color-mix(in_oklab,var(--primary)_65%,transparent)_40%,transparent_60%)]"
                    )}
                    className={cn(
                      "h-full w-full text-sm font-medium",
                      isFeatured
                        ? "bg-primary text-primary-foreground border-transparent"
                        : "bg-background/85 text-foreground border border-border/70 backdrop-blur"
                    )}
                  >
                    {plan.cta}
                  </MovingBorderButton>
                </div>
              </WobbleCard>
            </Reveal>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        All plans include unlimited data · no card required on Free · cancel
        anytime
      </p>
    </section>
  );
}
