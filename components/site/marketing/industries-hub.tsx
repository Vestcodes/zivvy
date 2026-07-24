"use client";

import Link from "next/link";
import {
  ArrowRight,
  Factory,
  GraduationCap,
  HeartPulse,
  Landmark,
  Laptop
} from "lucide-react";
import type { HubCardItem } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { BlurFade } from "@/components/ui/blur-fade";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

const INDUSTRY_META: Record<
  string,
  {
    Icon: React.ElementType;
    className: string;
    background: React.ReactNode;
    constraint: string;
  }
> = {
  healthcare: {
    Icon: HeartPulse,
    className: "col-span-3 lg:col-span-2",
    constraint: "Access control + audit trails on sensitive records",
    background: (
      <AnimatedGridPattern
        numSquares={18}
        maxOpacity={0.1}
        className="absolute inset-0 fill-primary/10 stroke-primary/20 [mask-image:radial-gradient(320px_circle_at_10%_0%,white,transparent)]"
      />
    )
  },
  education: {
    Icon: GraduationCap,
    className: "col-span-3 lg:col-span-1",
    constraint: "Term cycles, cohorts, and staff workflows",
    background: <div className="absolute inset-0 bg-primary/5" />
  },
  manufacturing: {
    Icon: Factory,
    className: "col-span-3 lg:col-span-1",
    constraint: "BOMs, work orders, quality holds",
    background: (
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 80% 10%, color-mix(in oklab, var(--primary) 16%, transparent), transparent 70%)"
        }}
      />
    )
  },
  saas: {
    Icon: Laptop,
    className: "col-span-3 lg:col-span-2",
    constraint: "Subscriptions, renewals, and usage-linked billing",
    background: (
      <DotPattern
        className={cn(
          "absolute inset-0 text-primary/30",
          "[mask-image:radial-gradient(280px_circle_at_80%_20%,white,transparent)]"
        )}
      />
    )
  },
  finance: {
    Icon: Landmark,
    className: "col-span-3 lg:col-span-3",
    constraint: "Close cadence, approvals, and reconciliation discipline",
    background: <div className="absolute inset-0 bg-muted/40" />
  }
};

type Props = {
  items: HubCardItem[];
};

export function IndustriesHubPage({ items }: Props) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <DotPattern
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 text-primary/25",
              "[mask-image:radial-gradient(520px_circle_at_50%_-10%,white,transparent)]"
            )}
          />
          <div className="relative mx-auto max-w-5xl px-6 pb-10 pt-20 text-center sm:pt-24">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  Industries · constraints · playbooks
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Industry-focused operating playbooks
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Every vertical has different constraints. Explore the workflows that match yours —
                without a generic template dump.
              </p>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-4">
          <BlurFade delay={0.05}>
            <BentoGrid className="auto-rows-[13.5rem] lg:auto-rows-[15rem]">
              {items.map((item) => {
                const meta = INDUSTRY_META[item.slug] ?? {
                  Icon: Factory,
                  className: "col-span-3 lg:col-span-1",
                  constraint: "Operator-first workflows",
                  background: <div className="absolute inset-0 bg-muted/30" />
                };
                return (
                  <BentoCard
                    key={item.slug}
                    name={item.title}
                    className={meta.className}
                    Icon={meta.Icon}
                    description={`${item.description} ${meta.constraint}.`}
                    href={`/industries/${item.slug}`}
                    cta="Open industry"
                    background={meta.background}
                  />
                );
              })}
            </BentoGrid>
          </BlurFade>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-6 py-10 md:grid-cols-2">
          <BlurFade>
            <MagicCard
              className="rounded-2xl border border-border/70 bg-card/70 p-6"
              gradientFrom="#34d399"
              gradientTo="#0f766e"
              gradientColor="rgba(27, 152, 114, 0.1)"
            >
              <h2 className="font-display text-xl font-semibold">Same product, different defaults</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Region tax, inventory depth, and manufacturing modules turn on by plan — not by
                buying another SKU.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link href="/features">
                  See feature tiers
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </MagicCard>
          </BlurFade>
          <BlurFade delay={0.06}>
            <MagicCard
              className="rounded-2xl border border-border/70 bg-card/70 p-6"
              gradientFrom="#0f766e"
              gradientTo="#34d399"
              gradientColor="rgba(27, 152, 114, 0.08)"
            >
              <h2 className="font-display text-xl font-semibold">Need a job-to-be-done view?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Start from a concrete workflow like month-close or CRM automation instead.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link href="/use-cases">
                  Explore use cases
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </MagicCard>
          </BlurFade>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-2 sm:pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8 text-center">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Talk industry fit
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Share your constraints — compliance, floor ops, or subscription billing — and we&apos;ll
              map a practical start.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/contact">Talk industry fit</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login#signup">Start free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
