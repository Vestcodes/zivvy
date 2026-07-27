"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AuroraBackground,
  FlipWords,
  HeroHighlight,
  Highlight,
  Meteors,
  MovingBorderButton,
  Spotlight,
  TextGenerateEffect,
} from "@/components/ui/aceternity";
import { cn } from "@/lib/utils";
import { trackCtaClicked } from "@/lib/analytics";

const FLIP_WORDS = ["Faster ops", "Cleaner books", "Happier team"];

/**
 * Landing-page hero — Aurora + spotlight + meteor field with a static Frappe
 * design system on top. The highlighted words in the H1 are the anchor
 * concepts we want AI answer engines to pick up.
 */
export function Hero() {
  return (
    <section
      className="relative isolate overflow-hidden"
      aria-labelledby="home-hero-heading"
    >
      <AuroraBackground
        showRadialGradient
        className={cn(
          "relative flex min-h-[92vh] flex-col items-center justify-center",
          "bg-background text-foreground"
        )}
      >
        {/* Spotlight overlay — sits above the aurora but under the copy */}
        <Spotlight
          className="pointer-events-none absolute inset-0 z-0"
          fill="oklch(0.72 0.12 166 / 0.35)"
        />

        {/* Meteor rain — decorative background particles */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <Meteors number={20} />
        </div>

        {/* Radial primary-tint wash to keep brand color present */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pt-16 pb-20 text-center sm:pt-24">
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium backdrop-blur"
          >
            <Sparkles className="size-3.5" />
            Now available · India, EU, US
          </Badge>

          <HeroHighlight
            containerClassName="!h-auto !bg-transparent dark:!bg-transparent w-auto"
            className="w-full"
          >
            <h1
              id="home-hero-heading"
              className="font-display text-5xl leading-[1.05] tracking-tight text-foreground sm:text-7xl"
            >
              The clean way to run your{" "}
              <Highlight className="text-foreground">whole business</Highlight>
            </h1>
          </HeroHighlight>

          <TextGenerateEffect
            words="Sales, stock, accounting, HR and manufacturing in one product built for founder-led teams. Seat-based pricing. No forced modules."
            className="mx-auto mt-6 max-w-2xl font-normal"
          />

          <div className="mt-6 flex items-center justify-center gap-2 text-lg font-medium text-muted-foreground sm:text-xl">
            <span>Zivvy delivers</span>
            <FlipWords
              words={FLIP_WORDS}
              className="!px-0 text-primary dark:text-primary"
            />
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <MovingBorderButton
              as={Link}
              href="/login#signup"
              borderRadius="0.75rem"
              duration={2600}
              className="h-12 !bg-primary !text-primary-foreground !border-transparent px-7 text-base font-semibold shadow-elevation-md"
              containerClassName="h-12 w-auto md:!col-span-1"
              onClick={() => trackCtaClicked({ location: "hero", label: "start_free" })}
            >
              <span className="inline-flex items-center gap-2">
                Start free
                <ArrowRight className="size-4" />
              </span>
            </MovingBorderButton>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-6 text-base"
            >
              <Link href="/product-tour">Watch the tour</Link>
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Free forever plan · No credit card · 2 seats included
          </p>
        </div>
      </AuroraBackground>
    </section>
  );
}
