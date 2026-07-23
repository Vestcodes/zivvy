import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  price: string;
  cadence: string;
  desc: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "per seat / month",
    desc: "Get started with sales, stock basics, and CRM.",
    features: ["2 seats", "Sales & CRM", "Basic stock", "Community support"],
    cta: "Get started"
  },
  {
    name: "Pro",
    price: "$15",
    cadence: "per seat / month",
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
    name: "Business",
    price: "$25",
    cadence: "per seat / month",
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

export function PricingPreview({ showIntro = true }: { showIntro?: boolean } = {}) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 sm:pb-24 pt-8">
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
      <div className={showIntro ? "mt-12 grid gap-4 lg:grid-cols-3" : "grid gap-4 lg:grid-cols-3"}>
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "relative border-border/70 transition-all",
              plan.highlighted
                ? "ring-2 ring-primary/40 shadow-elevation-md"
                : "bg-card/60"
            )}
          >
            {plan.highlighted && (
              <Badge className="bg-primary-gradient absolute -top-3 left-1/2 -translate-x-1/2 border-0 px-3 py-1 text-primary-foreground shadow-elevation-md">
                Most popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="font-display text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.desc}</CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.cadence}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
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
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className="w-full"
                variant={plan.highlighted ? "polished" : "outline"}
              >
                <Link href="/login#signup">{plan.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
