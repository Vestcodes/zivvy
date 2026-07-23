"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Billing = "monthly" | "annual";

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
    monthly: 15,
    annual: 12,
    desc: "Full accounting, stock, HR, and projects.",
    features: [
      "Accounting & tax",
      "Full stock & warehouses",
      "HR & payroll",
      "Barcode workflows",
      "Priority email"
    ],
    cta: "Try Pro",
    highlighted: true
  },
  {
    slug: "business",
    name: "Business",
    monthly: 25,
    annual: 20,
    desc: "Everything, plus manufacturing, assets, and multi-company.",
    features: [
      "Everything in Pro",
      "Manufacturing & BOMs",
      "Assets & quality",
      "Subcontracting",
      "Priority support"
    ],
    cta: "Talk to sales"
  }
];

interface Props {
  showIntro?: boolean;
  className?: string;
}

export function PricingPreview({ showIntro = true, className }: Props = {}) {
  const [billing, setBilling] = useState<Billing>("monthly");

  // Sync from URL on mount and on nav
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const b = params.get("billing");
    if (b === "annual" || b === "monthly") setBilling(b);
  }, []);

  function updateBilling(next: Billing) {
    setBilling(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (next === "monthly") url.searchParams.delete("billing");
      else url.searchParams.set("billing", next);
      history.replaceState(null, "", url.toString());
    }
  }

  return (
    <section className={cn("mx-auto max-w-6xl px-6 pb-16 pt-8 sm:pb-24", className)}>
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

      <div className={cn("mx-auto flex justify-center", showIntro ? "mt-8" : "")}>
        <div className="inline-flex items-center rounded-full border border-border/70 bg-card p-1 text-sm">
          <button
            type="button"
            onClick={() => updateBilling("monthly")}
            className={cn(
              "rounded-full px-4 py-1.5 font-medium transition-colors",
              billing === "monthly"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={billing === "monthly"}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => updateBilling("annual")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-medium transition-colors",
              billing === "annual"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={billing === "annual"}
          >
            Annual
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                billing === "annual"
                  ? "bg-primary-foreground/15 text-primary-foreground"
                  : "bg-primary/10 text-primary"
              )}
            >
              −20%
            </span>
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = billing === "annual" ? plan.annual : plan.monthly;
          const isFree = plan.slug === "free";
          const isRibbon = plan.highlighted;
          const href = `/login#signup?plan=${plan.slug}&billing=${billing}`;
          return (
            <Card
              key={plan.slug}
              className={cn(
                "relative border-border/70 transition-all",
                isRibbon
                  ? "ring-2 ring-primary/40 shadow-elevation-md"
                  : "bg-card/60 hover:-translate-y-0.5 hover:shadow-elevation-md"
              )}
            >
              {isRibbon && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="border-transparent bg-primary px-3 py-1 text-primary-foreground shadow-md">
                    Most popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-display text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.desc}</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
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
                  <p className="text-xs text-muted-foreground">
                    billed as{" "}
                    <span className="font-mono tabular-nums text-foreground">
                      ${plan.annual * 12}
                    </span>
                    /seat/year
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full"
                  variant={isRibbon ? "polished" : "outline"}
                >
                  <Link href={href}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        All plans include unlimited data · no card required on Free · cancel anytime
      </p>
    </section>
  );
}
