"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
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
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { ShineBorder } from "@/components/ui/shine-border";
import { cn } from "@/lib/utils";

const HeroHighlight = dynamic(
  () =>
    import("@/components/ui/aceternity/hero-highlight").then(
      (m) => m.HeroHighlight
    ),
  { ssr: false }
);

const Highlight = dynamic(
  () =>
    import("@/components/ui/aceternity/hero-highlight").then((m) => m.Highlight),
  { ssr: false }
);

type Tier = "Free" | "Pro" | "Business";

const TIER_BADGE: Record<Tier, string> = {
  Free: "bg-muted text-foreground border-transparent",
  Pro: "bg-primary-gradient text-primary-foreground border-transparent",
  Business: "bg-foreground text-background border-transparent"
};

type IndustryMeta = {
  Icon: React.ElementType;
  constraint: string;
  category: string;
  tier: Tier;
  gradient: string;
};

const INDUSTRY_META: Record<string, IndustryMeta> = {
  healthcare: {
    Icon: HeartPulse,
    constraint: "Row-level access + audit trails on every /records endpoint",
    category: "Regulated",
    tier: "Business",
    gradient:
      "radial-gradient(320px circle at 20% 0%, color-mix(in oklab, #ef4444 22%, transparent), transparent 60%)"
  },
  education: {
    Icon: GraduationCap,
    constraint: "Term cycles, cohorts, and staff webhooks",
    category: "Public",
    tier: "Pro",
    gradient:
      "radial-gradient(320px circle at 20% 0%, color-mix(in oklab, #f59e0b 22%, transparent), transparent 60%)"
  },
  manufacturing: {
    Icon: Factory,
    constraint: "/boms, /work-orders, quality.hold events",
    category: "Ops",
    tier: "Business",
    gradient:
      "radial-gradient(320px circle at 20% 0%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 60%)"
  },
  saas: {
    Icon: Laptop,
    constraint: "Subscriptions, renewals, subscription.renewed webhook",
    category: "Digital",
    tier: "Pro",
    gradient:
      "radial-gradient(320px circle at 20% 0%, color-mix(in oklab, #6366f1 22%, transparent), transparent 60%)"
  },
  finance: {
    Icon: Landmark,
    constraint: "Close cadence, /journals approvals, reconciliation.completed events",
    category: "Regulated",
    tier: "Pro",
    gradient:
      "radial-gradient(320px circle at 20% 0%, color-mix(in oklab, #0ea5e9 22%, transparent), transparent 60%)"
  }
};

const DEFAULT_META: IndustryMeta = {
  Icon: Factory,
  constraint: "Operator-first workflows",
  category: "Ops",
  tier: "Pro",
  gradient:
    "radial-gradient(320px circle at 20% 0%, color-mix(in oklab, var(--primary) 20%, transparent), transparent 60%)"
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

/**
 * card-hover-effect adapted for icon + description content, with sibling desaturation
 * (aceternity's HoverEffect only handles title/description strings, so this uses the
 * same interaction contract with richer content).
 */
function IndustryHoverGrid({ items }: { items: HubCardItem[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, idx) => {
        const meta = INDUSTRY_META[item.slug] ?? DEFAULT_META;
        const Icon = meta.Icon;
        const isHovered = hovered === idx;
        const isDimmed = hovered !== null && !isHovered;
        return (
          <Link
            key={item.slug}
            href={`/industries/${item.slug}`}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              "group relative block h-full rounded-2xl border border-border/70 bg-card/70 p-5 transition-all duration-300 ease-out",
              isHovered && "-translate-y-1 border-primary/40 shadow-xl shadow-primary/10",
              isDimmed && "opacity-50 [filter:saturate(0.4)] scale-[0.98]"
            )}
          >
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300",
                isHovered && "opacity-100"
              )}
              style={{ background: meta.gradient }}
            />
            <div className="relative">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg border border-border/60 bg-background/70 transition-all",
                    isHovered && "border-primary/40 bg-primary/10"
                  )}
                >
                  <Icon className="size-5 text-primary" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] font-medium">
                    {meta.category}
                  </Badge>
                  <Badge className={cn("text-[10px]", TIER_BADGE[meta.tier])}>
                    {meta.tier}
                  </Badge>
                </div>
              </div>
              <h3 className="mt-2 font-display text-lg font-semibold group-hover:text-primary">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              <p className="mt-3 rounded-md border border-border/50 bg-background/40 px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground">
                {meta.constraint}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Open industry
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function IndustriesHubPage({ items }: Props) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <HeroHighlight
            containerClassName="h-auto min-h-[26rem] py-16 sm:py-20 bg-transparent dark:bg-transparent"
            className="w-full px-6"
          >
            <div className="mx-auto max-w-4xl text-center">
              <BlurFade>
                <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                  <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                    Industries · constraints · playbooks
                  </AnimatedShinyText>
                </div>
              </BlurFade>
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Every industry runs on <Highlight>operations</Highlight>
              </h1>
              <BlurFade delay={0.2}>
                <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
                  Every vertical shares the same REST surface and webhook stream — with sector defaults
                  for tax, access control, and the fields you actually capture.
                </p>
              </BlurFade>
            </div>
          </HeroHighlight>

          <div className="relative mx-auto -mt-4 max-w-6xl px-6">
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
          <BlurFade>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Sector defaults, same tenant model
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Hover a card — siblings step back so you can read one sector at a time. Every card
              lists the constraint we already ship inside the product.
            </p>
          </BlurFade>
          <div className="mt-6">
            <IndustryHoverGrid items={items} />
          </div>
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
