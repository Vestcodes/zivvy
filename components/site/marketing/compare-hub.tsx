"use client";

import Link from "next/link";
import { ArrowRight, Check, GitCompareArrows, Minus, Scale } from "lucide-react";
import type { HubCardItem } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BorderBeam } from "@/components/ui/border-beam";
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

const COMPARE_META: Record<string, { category: string; tier: Tier }> = {
  odoo: { category: "ERP suite", tier: "Business" },
  zoho: { category: "App bundle", tier: "Pro" },
  netsuite: { category: "Enterprise ERP", tier: "Business" }
};

const LENS_CHIPS = [
  "Pricing clarity",
  "Time to first value",
  "Operator UX",
  "Implementation weight",
  "REST + webhook surface",
  "Migration path"
];

const HERO_ROWS = [
  {
    label: "Pricing",
    zivvy: "Seat-based · one line",
    other: "Modules + add-ons + quotes"
  },
  {
    label: "API",
    zivvy: "REST + webhooks per resource",
    other: "Varies per module"
  },
  {
    label: "Setup",
    zivvy: "Days · opinionated defaults",
    other: "Weeks · implementation partner"
  }
];

type Props = {
  items: HubCardItem[];
};

function VsCard({ item, index }: { item: HubCardItem; index: number }) {
  const other = item.title.replace(/^Zivvy vs\s+/i, "").trim() || item.title;
  const meta = COMPARE_META[item.slug] ?? { category: "Comparison", tier: "Pro" as Tier };

  return (
    <BlurFade delay={0.04 + index * 0.05}>
      <Link href={`/compare/${item.slug}`} className="group block h-full">
        <MagicCard
          className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-0"
          gradientFrom="#34d399"
          gradientTo="#0f766e"
          gradientColor="rgba(27, 152, 114, 0.12)"
        >
          <BorderBeam
            size={80}
            duration={8}
            delay={index * 1.2}
            colorFrom="#34d399"
            colorTo="#0f766e"
            borderWidth={1.5}
          />
          <div className="flex h-full flex-col p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-end gap-1.5">
              <Badge variant="outline" className="text-[10px] font-medium">
                {meta.category}
              </Badge>
              <Badge className={cn("text-[10px]", TIER_BADGE[meta.tier])}>{meta.tier}</Badge>
            </div>
            <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-3 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">Zivvy</p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-full border border-border/70 bg-background text-xs font-semibold text-muted-foreground">
                vs
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/40 px-3 py-3 text-center">
                <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {other}
                </p>
              </div>
            </div>
            <h2 className="font-display text-xl font-semibold group-hover:text-primary">
              {item.title}
            </h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{item.description}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Open comparison
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </MagicCard>
      </Link>
    </BlurFade>
  );
}

export function CompareHubPage({ items }: Props) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(90deg, color-mix(in oklab, var(--primary) 12%, transparent) 0%, transparent 45%, transparent 55%, color-mix(in oklab, var(--muted-foreground) 8%, transparent) 100%)"
            }}
          />
          <div className="relative mx-auto max-w-5xl px-6 pb-4 pt-20 text-center sm:pt-24">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <Scale className="size-3.5 text-primary" />
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  Compare · side by side · no fluff
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Zivvy versus the incumbents
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Every capability is a REST resource with a matching webhook event. Compare that
                surface against the incumbent&apos;s module bundle — not marketing bullets.
              </p>
            </BlurFade>
          </div>

          <div className="relative mx-auto mt-10 max-w-4xl px-6">
            <BlurFade delay={0.08}>
              <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
                <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-primary">
                      Zivvy
                    </span>
                    <Badge className="bg-primary-gradient text-primary-foreground text-[10px]">
                      Free · Pro · Business
                    </Badge>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {HERO_ROWS.map((r) => (
                      <li key={r.label} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span>
                          <span className="font-medium">{r.label}: </span>
                          <span className="text-muted-foreground">{r.zivvy}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="hidden items-center justify-center md:flex">
                  <div className="flex size-11 items-center justify-center rounded-full border border-border/70 bg-background text-xs font-semibold text-muted-foreground shadow-sm">
                    vs
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-muted/30 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Incumbent
                    </span>
                    <Badge variant="outline" className="text-[10px]">Suite / bundle</Badge>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {HERO_ROWS.map((r) => (
                      <li key={r.label} className="flex items-start gap-2">
                        <Minus className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                        <span>
                          <span className="font-medium">{r.label}: </span>
                          <span className="text-muted-foreground">{r.other}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-4 pt-14">
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <GitCompareArrows className="size-4 text-primary" />
            <span>Zivvy on the left. The alternative on the right.</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <VsCard key={item.slug} item={item} index={index} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10">
          <BlurFade>
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              What each comparison covers
            </p>
          </BlurFade>
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/40 py-2">
            <Marquee pauseOnHover reverse className="[--duration:26s]">
              {LENS_CHIPS.map((chip) => (
                <div
                  key={chip}
                  className={cn(
                    "mx-2 rounded-lg border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium shadow-sm"
                  )}
                >
                  {chip}
                </div>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-background to-transparent" />
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-2 sm:pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8 text-center">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={12} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Want a factual scorecard?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Send us the incumbent&apos;s current invoice and module list. We&apos;ll return a
              row-by-row scorecard, no sales spin.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/contact">Request a scorecard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/alternatives">See migration paths</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
