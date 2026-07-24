"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ProductTourVideo } from "@/components/site/product-tour-video";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    time: "00:00",
    title: "Land in Business",
    body: "Open the live workspace and the dashboard your team actually uses."
  },
  {
    time: "00:25",
    title: "CRM → cash",
    body: "Leads, quotes, orders, and invoices without hopping tools."
  },
  {
    time: "01:00",
    title: "Stock, books, people",
    body: "Inventory, payments, and HR in the same product."
  },
  {
    time: "01:40",
    title: "Make & inspect",
    body: "BOMs, work orders, and quality — Business-tier depth."
  }
];

export function ProductTourPageContent() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <DotPattern
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 text-primary/30",
              "[mask-image:radial-gradient(420px_circle_at_50%_0%,white,transparent)]"
            )}
          />
          <div className="mx-auto max-w-3xl px-6 pb-6 pt-20 text-center sm:pt-24">
            <BlurFade>
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                See Zivvy in motion
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                A short Business-tier tour — CRM through manufacturing.
              </p>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-2">
          <BlurFade delay={0.08}>
            <ProductTourVideo showBeam animationStyle="top-in-bottom-out" />
          </BlurFade>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-12">
          <ol className="grid gap-3 sm:grid-cols-2">
            {STEPS.map((step, index) => (
              <BlurFade key={step.title} delay={0.05 + index * 0.05}>
                <li>
                  <MagicCard
                    className="h-full rounded-xl border border-border/70 bg-card/70 p-5"
                    gradientFrom="#34d399"
                    gradientTo="#0f766e"
                    gradientColor="rgba(27, 152, 114, 0.1)"
                  >
                    <p className="font-mono text-xs text-muted-foreground">
                      {step.time}
                    </p>
                    <h2 className="mt-1 font-display text-lg font-semibold">{step.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                  </MagicCard>
                </li>
              </BlurFade>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-4 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Try the same flow yourself
          </h2>
          <p className="mt-3 text-muted-foreground">Free plan. Two seats. No card.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
            <Button asChild variant="outline" size="lg" className="h-12 px-6">
              <Link href="/contact">Talk to us</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
