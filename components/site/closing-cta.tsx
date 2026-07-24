"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <DotPattern
        glow
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 text-primary/40",
          "[mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 40%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 70%)"
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, color-mix(in oklab, var(--primary) 30%, transparent), transparent)"
        }}
      />
      <BlurFade>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="size-3.5 text-primary" />
            <span>2 seats free forever — no credit card</span>
          </div>
          <h2 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            Ship your business.
            <br />
            <span className="italic text-foreground/85">Not another spreadsheet.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Set up in twenty minutes. Migrate from whatever you&apos;re on. Cancel any time. Nothing to
            lose.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login#signup" className="inline-flex">
              <ShimmerButton
                className="h-12 px-7 text-base"
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
              <Link href="/contact">Talk to a human</Link>
            </Button>
          </div>
        </div>
      </BlurFade>
    </section>
  );
}
