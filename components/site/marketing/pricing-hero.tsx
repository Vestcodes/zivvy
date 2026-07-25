"use client";

import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { TextAnimate } from "@/components/ui/text-animate";

export function PricingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% -10%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 75%)"
        }}
      />
      <div className="relative mx-auto max-w-3xl px-6 pt-20 pb-4 text-center sm:pt-24">
        <BlurFade>
          <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
            <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
              Free · Pro $18 · Business $30 · Add-ons from $15
            </AnimatedShinyText>
          </div>
          <TextAnimate
            as="h1"
            by="word"
            animation="blurInUp"
            className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Pricing that matches your growth
          </TextAnimate>
          <p className="mt-4 text-lg text-muted-foreground">
            Start on Free. Upgrade the moment a feature earns its keep. Add-ons layer on
            when you need them — never before.
          </p>
        </BlurFade>
      </div>
    </section>
  );
}
