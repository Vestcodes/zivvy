"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MovingBorderButton,
  WavyBackground,
} from "@/components/ui/aceternity";
import { trackCtaClicked } from "@/lib/analytics";

/**
 * Final CTA — full-width Wavy canvas with the Start free / Book a demo pair.
 */
export function ClosingCta() {
  return (
    <section className="relative isolate overflow-hidden">
      <WavyBackground
        containerClassName="!h-auto py-20 sm:py-28"
        className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
        colors={[
          "#34d399",
          "#0f766e",
          "#22d3ee",
          "#818cf8",
          "#a78bfa",
        ]}
        backgroundFill="#020617"
        waveOpacity={0.45}
        blur={12}
        speed="slow"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          <Sparkles className="size-3.5 text-emerald-300" />
          <span>2 seats free forever — no credit card</span>
        </div>

        <h2 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-6xl">
          Ship your business.
          <br />
          <span className="italic text-white/85">Not another spreadsheet.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
          Set up in twenty minutes. Migrate from whatever you&apos;re on. Cancel
          any time. Nothing to lose.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <MovingBorderButton
            as={Link}
            href="/login#signup"
            borderRadius="0.75rem"
            duration={2600}
            className="h-12 !bg-primary !text-primary-foreground !border-transparent px-7 text-base font-semibold shadow-elevation-md"
            containerClassName="h-12 w-auto md:!col-span-1"
            onClick={() => trackCtaClicked({ location: "closing_cta", label: "start_free" })}
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
            className="h-12 border-white/25 bg-white/10 px-6 text-base text-white hover:bg-white/20 hover:text-white"
          >
            <Link href="/contact">Book a demo</Link>
          </Button>
        </div>
      </WavyBackground>
    </section>
  );
}
