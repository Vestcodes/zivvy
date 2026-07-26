"use client";

import { motion } from "motion/react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Spotlight, HeroHighlight, Highlight } from "@/components/ui/aceternity";
import {
  usePricingBilling,
  type BillingCycle
} from "@/components/site/pricing-billing-provider";
import { LocalisedPrice } from "@/components/pricing/localised-price";
import { RegionPicker } from "@/components/pricing/region-picker";
import { cn } from "@/lib/utils";

const OPTIONS: { value: BillingCycle; label: string; hint?: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual", hint: "−20%" }
];

/**
 * Pricing hero — Aceternity Spotlight over a subtle grid, HeroHighlight
 * headline with the Aceternity `<Highlight>` swipe on "scales with you",
 * and an animated pill toggle (Aceternity Tabs-style — motion `layoutId`
 * drives the sliding indicator) for monthly vs annual billing.
 *
 * The toggle writes to the shared `PricingBillingProvider` so the tier
 * cards downstream re-render immediately.
 */
export function PricingHero() {
  const { billing, setBilling } = usePricingBilling();

  return (
    <Spotlight
      className="relative isolate w-full"
      fill="color-mix(in oklab, var(--primary) 22%, transparent)"
    >
      {/* Subtle animated grid background. */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <AnimatedGridPattern
          numSquares={22}
          maxOpacity={0.08}
          duration={5}
          repeatDelay={1.2}
          width={44}
          height={44}
          className={cn(
            "absolute inset-x-0 inset-y-[-20%] h-[140%] w-full",
            "[mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]",
            "fill-primary/30 stroke-primary/30"
          )}
        />
      </div>

      <HeroHighlight
        containerClassName="h-auto bg-transparent dark:bg-transparent px-6 py-16 sm:py-20"
        className="mx-auto max-w-3xl text-center"
      >
        <BlurFade>
          <div className="mb-6 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
            <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                Free · Pro{" "}
                <LocalisedPrice
                  tier="pro"
                  billing="monthly"
                  amountCents={1800}
                />{" "}
                · Business{" "}
                <LocalisedPrice
                  tier="business"
                  billing="monthly"
                  amountCents={3000}
                />{" "}
                · Add-ons from <LocalisedPrice amountCents={1500} />
              </span>
            </AnimatedShinyText>
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Pricing that{" "}
            <Highlight className="from-primary/30 to-accent/40 dark:from-primary/40 dark:to-accent/50 text-foreground">
              scales with you
            </Highlight>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Start on Free. Upgrade the moment a feature earns its keep. Add-ons
            layer on when you need them — never before.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <BillingToggle billing={billing} onChange={setBilling} />
            <RegionPicker label="Prices in" />
          </div>
        </BlurFade>
      </HeroHighlight>
    </Spotlight>
  );
}

/**
 * Aceternity-style animated pill. A single motion `layoutId` slides the
 * active background between the two options — no CSS transitions needed.
 */
function BillingToggle({
  billing,
  onChange
}: {
  billing: BillingCycle;
  onChange: (next: BillingCycle) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Billing period"
      className="relative inline-flex items-center rounded-full border border-border/70 bg-card/70 p-1 text-sm shadow-sm backdrop-blur"
    >
      {OPTIONS.map((opt) => {
        const isActive = billing === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative z-10 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-medium transition-colors",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="pricing-billing-pill"
                className="absolute inset-0 -z-10 rounded-full bg-primary shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.55 }}
              />
            )}
            <span>{opt.label}</span>
            {opt.hint && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                  isActive
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "bg-primary/10 text-primary"
                )}
              >
                {opt.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
