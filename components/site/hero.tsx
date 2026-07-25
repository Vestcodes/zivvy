"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Spotlight } from "@/components/ui/spotlight";
import { ProductTourVideo } from "@/components/site/product-tour-video";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="oklch(0.72 0.12 166)" />
      <AnimatedGridPattern
        numSquares={42}
        maxOpacity={0.12}
        duration={3}
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 h-full w-full fill-primary/15 stroke-primary/20",
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 70%)"
        }}
      />
      <div className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center sm:pt-32">
        <BlurFade delay={0.05}>
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium backdrop-blur"
          >
            <Sparkles className="size-3.5" />
            Now available · India, EU, US
          </Badge>
        </BlurFade>
        <BlurFade delay={0.12}>
          <h1 className="font-display text-5xl leading-[1.02] tracking-tight text-foreground sm:text-7xl">
            The clean way to run your <em className="italic text-foreground/85">whole business</em>.
          </h1>
        </BlurFade>
        <BlurFade delay={0.2}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Sales, stock, accounting, HR and manufacturing in one product built for
            founder-led teams. Seat-based pricing. No forced modules. Your data in the
            region you pick.
          </p>
        </BlurFade>
        <BlurFade delay={0.28} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/login#signup" className="inline-flex">
            <ShimmerButton
              className="h-12 px-7 text-base shadow-elevation-md"
              background="linear-gradient(180deg, color-mix(in oklab, var(--primary) 88%, white), var(--primary))"
              shimmerColor="#ecfdf5"
              borderRadius="0.75rem"
            >
              <span className="inline-flex items-center gap-2">
                Start free
                <ArrowRight className="size-4" />
              </span>
            </ShimmerButton>
          </Link>
          <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
            <Link href="/product-tour">Watch the tour</Link>
          </Button>
        </BlurFade>
        <BlurFade delay={0.34}>
          <p className="mt-6 text-xs text-muted-foreground">
            Free forever plan · No credit card · 2 seats included
          </p>
        </BlurFade>

        <BlurFade delay={0.4} className="mx-auto mt-12 max-w-4xl">
          <ProductTourVideo showBeam animationStyle="from-center" />
        </BlurFade>
      </div>
    </section>
  );
}
