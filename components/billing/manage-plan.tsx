"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { createCheckout, createPortalSession } from "@/lib/billing-client";
import { FrappeError } from "@/lib/frappe-client";
import type { ZivvyTier } from "@/lib/boot-types";
import { cn } from "@/lib/utils";

const PLANS: {
  tier: Exclude<ZivvyTier, "free">;
  name: string;
  price: string;
  desc: string;
  features: string[];
  highlighted?: boolean;
}[] = [
  {
    tier: "pro",
    name: "Pro",
    price: "$15",
    desc: "Full accounting, stock, HR, and projects.",
    features: [
      "Accounting & tax",
      "Full stock & warehouses",
      "HR & payroll",
      "Barcode workflows"
    ],
    highlighted: true
  },
  {
    tier: "business",
    name: "Business",
    price: "$25",
    desc: "Manufacturing, assets, subcontracting, multi-company.",
    features: [
      "Everything in Pro",
      "Manufacturing & BOMs",
      "Assets & quality",
      "Subcontracting"
    ]
  }
];

export function ManagePlan({ hasSubscription, currentTier }: { hasSubscription: boolean; currentTier: ZivvyTier }) {
  const [pending, setPending] = useState<string | null>(null);

  async function onPortal() {
    setPending("portal");
    try {
      const res = await createPortalSession();
      if (res.ok && res.url) {
        window.location.href = res.url;
      } else if (res.requires_checkout) {
        toast.info("No active subscription yet — pick a plan below.");
      } else {
        toast.error("Could not open the billing portal.");
      }
    } catch (err) {
      toast.error(err instanceof FrappeError ? err.message : "Portal unavailable.");
    } finally {
      setPending(null);
    }
  }

  async function onCheckout(tier: Exclude<ZivvyTier, "free">) {
    setPending(tier);
    try {
      const res = await createCheckout(tier);
      if (res.url) {
        window.location.href = res.url;
      } else {
        toast.error("Checkout URL missing from response.");
      }
    } catch (err) {
      toast.error(err instanceof FrappeError ? err.message : "Checkout unavailable.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-6">
      {hasSubscription && (
        <Card className="border-border/70 bg-card/60">
          <CardHeader>
            <CardTitle className="font-display text-lg">Manage subscription</CardTitle>
            <CardDescription>
              Update payment, seats, or cancel via Polar's customer portal.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={onPortal} disabled={pending === "portal"} variant="polished">
              {pending === "portal" ? "Opening portal…" : (
                <>
                  Open billing portal
                  <ExternalLink className="size-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight">
          {currentTier === "free" ? "Upgrade" : "Change plan"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pay per seat. Change or cancel anytime.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {PLANS.map((plan) => {
            const isCurrent = plan.tier === currentTier;
            return (
              <Card
                key={plan.tier}
                className={cn(
                  "relative border-border/70",
                  plan.highlighted && !isCurrent && "shadow-brand ring-2 ring-primary/40",
                  isCurrent && "opacity-70"
                )}
              >
                <CardHeader>
                  <CardTitle className="font-display">{plan.name}</CardTitle>
                  <CardDescription>{plan.desc}</CardDescription>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">per seat / month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.highlighted && !isCurrent ? "polished" : "outline"}
                    disabled={isCurrent || pending === plan.tier}
                    onClick={() => onCheckout(plan.tier)}
                  >
                    {isCurrent
                      ? "Current plan"
                      : pending === plan.tier
                        ? "Opening checkout…"
                        : `Switch to ${plan.name}`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
