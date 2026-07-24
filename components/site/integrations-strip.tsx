"use client";

import Link from "next/link";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";

const INTEGRATIONS = [
  "Slack",
  "Salesforce",
  "HubSpot",
  "Zapier",
  "Google Drive",
  "Stripe",
  "QuickBooks",
  "Shopify"
];

export function IntegrationsStrip() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/60 px-6 py-8 sm:flex-row">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Integrations that fit your stack
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect GTM, communication, and reporting workflows without rebuilding everything.
          </p>
        </div>
        <Link
          href="/integrations"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Explore integrations
        </Link>
      </div>
      <div className="relative mt-4 overflow-hidden rounded-xl border border-border/60 bg-background/50 py-2">
        <p className="sr-only">
          Example integrations: {INTEGRATIONS.join(", ")}.
        </p>
        <Marquee pauseOnHover aria-hidden className="[--duration:28s]">
          {INTEGRATIONS.map((name) => (
            <div
              key={name}
              className={cn(
                "mx-2 rounded-lg border border-border/70 bg-card/80 px-5 py-3 text-sm font-medium shadow-sm"
              )}
            >
              {name}
            </div>
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}
