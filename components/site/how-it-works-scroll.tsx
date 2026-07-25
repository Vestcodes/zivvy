"use client";

import { StickyScroll } from "@/components/ui/aceternity";
import { BlurFade } from "@/components/ui/blur-fade";

const STEPS = [
  {
    title: "Sign up in two minutes",
    description:
      "Pick India, EU, or US at signup. Your workspace boots with sensible defaults — chart of accounts, tax templates, and the modules you flipped on.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-emerald-500 to-teal-700 text-white">
        <span className="text-4xl">01</span>
        <p className="text-sm opacity-90">1 workspace · 2 seats · $0</p>
      </div>
    ),
  },
  {
    title: "Import your data",
    description:
      "CSV import for customers, suppliers, items, opening stock and opening balances. Larger migrations from Odoo, SAP B1 or Zoho get mapping help.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-indigo-500 to-purple-700 text-white">
        <span className="text-4xl">02</span>
        <p className="text-sm opacity-90">CSV · Odoo · Tally · Zoho</p>
      </div>
    ),
  },
  {
    title: "Configure integrations",
    description:
      "Slack, Stripe, HubSpot, Shopify — connect the systems your team already uses. Signed webhooks push events where you need them.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-orange-500 to-amber-600 text-white">
        <span className="text-4xl">03</span>
        <p className="text-sm opacity-90">Slack · Stripe · Shopify</p>
      </div>
    ),
  },
  {
    title: "Ship it",
    description:
      "Run your first real workflow the same day — quote to invoice, or receive to ship. Upgrade only when a module earns its seat.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-pink-500 to-rose-700 text-white">
        <span className="text-4xl">04</span>
        <p className="text-sm opacity-90">Day-one live · no rollout theatre</p>
      </div>
    ),
  },
];

export function HowItWorksScroll() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <BlurFade>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            How teams start on Zivvy
          </h2>
          <p className="mt-3 text-muted-foreground">
            Four steps. No implementation theatre. Scroll to walk through the
            onboarding your team will actually do.
          </p>
        </div>
      </BlurFade>

      <div className="mt-12 overflow-hidden rounded-2xl border border-border/60">
        <StickyScroll content={STEPS} />
      </div>
    </section>
  );
}
