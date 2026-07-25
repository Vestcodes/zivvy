"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import { InfiniteMovingCards } from "@/components/ui/aceternity";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";

const QUOTES = [
  {
    quote:
      "We ripped out four tools in one weekend. Books close on the second, not the tenth.",
    name: "Priya S.",
    title: "Ops lead · consumer brand",
  },
  {
    quote:
      "Seat-based pricing meant we finally rolled ERP to the warehouse without a budget fight.",
    name: "Marc D.",
    title: "Founder · industrial supply",
  },
  {
    quote:
      "The API is the first ERP one I did not curse at. HMAC webhooks worked on the first try.",
    name: "Jonas W.",
    title: "Engineering · SaaS platform",
  },
  {
    quote:
      "Bank reconciliation is boring again. That's the highest compliment I can give.",
    name: "Anaïs R.",
    title: "Finance · agency",
  },
];

const INTEGRATIONS = [
  "Slack",
  "Salesforce",
  "HubSpot",
  "Zapier",
  "Google Drive",
  "Stripe",
  "QuickBooks",
  "Shopify",
  "Notion",
  "Xero",
];

export function SocialProof() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <BlurFade>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Teams that made the switch
            </h2>
            <p className="mt-3 text-muted-foreground">
              Real operators, real quotes. No stars, no vanity counts.
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.1}>
          <div className="mt-10 flex justify-center">
            <InfiniteMovingCards
              items={QUOTES}
              direction="left"
              speed="slow"
              pauseOnHover
              className="max-w-full"
            />
          </div>
        </BlurFade>

        <BlurFade delay={0.2}>
          <div className="relative mt-14 overflow-hidden rounded-2xl border border-border/70 bg-card/60 py-3">
            <p className="sr-only">
              Example integrations: {INTEGRATIONS.join(", ")}.
            </p>
            <Marquee pauseOnHover aria-hidden className="[--duration:36s]">
              {INTEGRATIONS.map((name) => (
                <span
                  key={name}
                  className={cn(
                    "mx-2 rounded-full border border-border/70 bg-background/70 px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm"
                  )}
                >
                  {name}
                </span>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
