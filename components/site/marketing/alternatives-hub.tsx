"use client";

import Link from "next/link";
import { ArrowRight, Check, Map, Minus, Route } from "lucide-react";
import type { HubCardItem } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedList } from "@/components/ui/animated-list";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

type Tier = "Free" | "Pro" | "Business";

const TIER_BADGE: Record<Tier, string> = {
  Free: "bg-muted text-foreground border-transparent",
  Pro: "bg-primary-gradient text-primary-foreground border-transparent",
  Business: "bg-foreground text-background border-transparent"
};

const ALTERNATIVE_META: Record<string, { category: string; tier: Tier }> = {
  odoo: { category: "ERP suite", tier: "Business" },
  zoho: { category: "App bundle", tier: "Pro" },
  "legacy-erp": { category: "Legacy ERP", tier: "Business" }
};

const MIGRATION_STREAM = [
  "Map current tools → Zivvy modules",
  "Pilot one business unit",
  "Import customers & open orders",
  "Train owners on day-1 workflows",
  "Cut over reporting, then retire legacy"
];

const TEASER_ROWS = [
  { row: "Pricing model", zivvy: "Seat-based, one line item", other: "Modules, add-ons, quotes" },
  { row: "API surface", zivvy: "Every resource is REST + webhooks", other: "Varies per module" },
  { row: "Tenant model", zivvy: "One tenant, roles by scope", other: "Often instance-per-BU" },
  { row: "Time to first value", zivvy: "Days", other: "Weeks to quarters" }
];

type Props = {
  items: HubCardItem[];
};

export function AlternativesHubPage({ items }: Props) {
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
                "radial-gradient(ellipse 70% 55% at 50% -10%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 75%)"
            }}
          />
          <div className="relative mx-auto max-w-4xl px-6 pb-4 pt-20 text-center sm:pt-24">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <Route className="size-3.5 text-primary" />
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  Alternatives · migration paths · low drama
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Looking for alternatives?
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Same tenant boundary, same REST + webhook surface — different lift-and-shift path per
                incumbent. Not feature-bingo scorecards.
              </p>
            </BlurFade>
          </div>

          <div className="relative mx-auto mt-8 max-w-3xl px-6">
            <BlurFade delay={0.08}>
              <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-lg shadow-primary/5">
                <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
                <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-0 border-b border-border/50 bg-background/60 text-xs font-medium">
                  <div className="px-4 py-3 text-muted-foreground">Capability</div>
                  <div className="border-l border-border/50 px-4 py-3 text-center text-primary">
                    Zivvy
                  </div>
                  <div className="border-l border-border/50 px-4 py-3 text-center text-muted-foreground">
                    Incumbent
                  </div>
                </div>
                {TEASER_ROWS.map((r, i) => (
                  <div
                    key={r.row}
                    className={cn(
                      "grid grid-cols-[1.5fr_1fr_1fr] gap-0 text-sm",
                      i !== TEASER_ROWS.length - 1 && "border-b border-border/40"
                    )}
                  >
                    <div className="px-4 py-3 font-medium">{r.row}</div>
                    <div className="flex items-center gap-2 border-l border-border/40 bg-primary/5 px-4 py-3">
                      <Check className="size-3.5 shrink-0 text-primary" />
                      <span className="text-xs">{r.zivvy}</span>
                    </div>
                    <div className="flex items-center gap-2 border-l border-border/40 px-4 py-3">
                      <Minus className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{r.other}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Teaser view — every alternative below expands each row into a rollout plan.
              </p>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-8 pt-14 lg:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item, index) => {
              const meta = ALTERNATIVE_META[item.slug] ?? {
                category: "Alternative",
                tier: "Pro" as Tier
              };
              return (
                <BlurFade key={item.slug} delay={0.04 + index * 0.04}>
                  <Link href={`/alternatives/${item.slug}`} className="group block h-full">
                    <MagicCard
                      className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5"
                      gradientFrom="#34d399"
                      gradientTo="#0f766e"
                      gradientColor="rgba(27, 152, 114, 0.1)"
                    >
                      <BorderBeam
                        size={70}
                        duration={9}
                        delay={index * 0.8}
                        colorFrom="#34d399"
                        colorTo="#0f766e"
                        borderWidth={1.25}
                      />
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Migration path
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {meta.category}
                          </Badge>
                          <Badge className={cn("text-[10px]", TIER_BADGE[meta.tier])}>
                            {meta.tier}
                          </Badge>
                        </div>
                      </div>
                      <h2 className="mt-2 font-display text-lg font-semibold group-hover:text-primary">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        Open migration guide
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </MagicCard>
                  </Link>
                </BlurFade>
              );
            })}
          </div>

          <BlurFade delay={0.1}>
            <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5">
              <ShineBorder shineColor={["#0f766e", "#34d399"]} duration={16} />
              <div className="mb-2 flex items-center gap-2">
                <Map className="size-4 text-primary" />
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Typical rollout sequence
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Pilot first. Expand when owners trust the daily path.
              </p>
              <div className="mt-5 min-h-[15rem]">
                <AnimatedList delay={1300} className="gap-2">
                  {MIGRATION_STREAM.map((step) => (
                    <div
                      key={step}
                      className="w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-left text-sm shadow-sm"
                    >
                      {step}
                    </div>
                  ))}
                </AnimatedList>
              </div>
            </div>
          </BlurFade>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-4 sm:pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8 text-center">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Bring your migration plan
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Share the tenants, seats, and modules you run today. We&apos;ll return a written
              cut-over sequence with data-import checkpoints.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/contact">Plan your migration</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/compare">See side-by-sides</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
