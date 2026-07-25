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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { BlurFade } from "@/components/ui/blur-fade";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

type Tier = "Free" | "Pro" | "Business";

const TIER_BADGE: Record<Tier, string> = {
  Free: "bg-muted text-foreground border-transparent",
  Pro: "bg-primary-gradient text-primary-foreground border-transparent",
  Business: "bg-foreground text-background border-transparent"
};

const INDUSTRY_META: Record<
  string,
  {
    Icon: React.ElementType;
    className: string;
    background: React.ReactNode;
    constraint: string;
    category: string;
    tier: Tier;
  }
> = {
  healthcare: {
    Icon: HeartPulse,
    className: "col-span-3 lg:col-span-2",
    constraint: "Row-level access + audit trails on every /records endpoint",
    category: "Regulated",
    tier: "Business",
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
    constraint: "Term cycles, cohorts, and staff webhooks",
    category: "Public",
    tier: "Pro",
    background: <div className="absolute inset-0 bg-primary/5" />
  },
  manufacturing: {
    Icon: Factory,
    className: "col-span-3 lg:col-span-1",
    constraint: "/boms, /work-orders, quality.hold events",
    category: "Ops",
    tier: "Business",
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
    constraint: "Subscriptions, renewals, subscription.renewed webhook",
    category: "Digital",
    tier: "Pro",
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
    constraint: "Close cadence, /journals approvals, reconciliation.completed events",
    category: "Regulated",
    tier: "Pro",
    background: <div className="absolute inset-0 bg-muted/40" />
  }
};

const INDUSTRY_MARQUEE = [
  "Healthcare",
  "Med devices",
  "Higher education",
  "K-12",
  "Discrete manufacturing",
  "Process manufacturing",
  "SaaS",
  "Fintech",
  "Public sector",
  "3PL & logistics",
  "Retail chains",
  "Professional services"
];

type Props = {
  items: HubCardItem[];
};

export function IndustriesHubPage({ items }: Props) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="relative mx-auto max-w-5xl px-6 pb-4 pt-20 text-center sm:pt-24">
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
                Same tenant. Different defaults.
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Every vertical shares the same REST surface and webhook stream — with sector defaults
                for tax, access control, and the fields you actually capture.
              </p>
            </BlurFade>
          </div>

          <div className="relative mx-auto mt-10 max-w-6xl px-6">
            <BlurFade delay={0.08}>
              <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background/40 py-3">
                <Marquee pauseOnHover className="[--duration:34s]">
                  {INDUSTRY_MARQUEE.map((label) => (
                    <div
                      key={label}
                      className="mx-2 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm font-medium shadow-sm"
                    >
                      {label}
                    </div>
                  ))}
                </Marquee>
                <Marquee pauseOnHover reverse className="mt-2 [--duration:38s]">
                  {[...INDUSTRY_MARQUEE].reverse().map((label) => (
                    <div
                      key={`${label}-r`}
                      className="mx-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-2 text-sm font-medium text-primary shadow-sm"
                    >
                      {label}
                    </div>
                  ))}
                </Marquee>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent" />
              </div>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-4 pt-14">
          <BlurFade delay={0.05}>
            <BentoGrid className="auto-rows-[13.5rem] lg:auto-rows-[15rem]">
              {items.map((item) => {
                const meta = INDUSTRY_META[item.slug] ?? {
                  Icon: Factory,
                  className: "col-span-3 lg:col-span-1",
                  constraint: "Operator-first workflows",
                  category: "Ops",
                  tier: "Pro" as Tier,
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
                    background={
                      <>
                        {meta.background}
                        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
                          <Badge variant="outline" className="bg-background/70 text-[10px] backdrop-blur">
                            {meta.category}
                          </Badge>
                          <Badge className={cn("text-[10px]", TIER_BADGE[meta.tier])}>
                            {meta.tier}
                          </Badge>
                        </div>
                      </>
                    }
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
                buying another SKU or spinning up another tenant.
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
                Each play maps to the REST resources and webhook events it touches — start from a
                concrete workflow instead.
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
              Vertical compliance questions?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Ask about HIPAA, GDPR data residency, batch traceability, or subscription-tax
              behavior. We answer in detail — not with sales theatre.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/contact">Ask compliance</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/security">Security overview</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
