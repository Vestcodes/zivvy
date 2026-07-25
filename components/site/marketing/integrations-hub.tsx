"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Cloud, Link2, Webhook, Zap } from "lucide-react";
import type { HubCardItem } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { NumberTicker } from "@/components/ui/number-ticker";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

const ORBIT_LABELS = ["Slack", "HubSpot", "Drive", "Zapier", "SFDC", "API"];

const PATTERN_CHIPS = [
  "Webhooks out",
  "Secure API in",
  "Event-driven sync",
  "No black-box glue",
  "Owner on the record",
  "Audit-friendly"
];

const CATEGORIES = [
  "All",
  "Payments",
  "Ecommerce",
  "Communication",
  "Analytics",
  "Compliance",
  "Developer"
] as const;

type Category = (typeof CATEGORIES)[number];

const DOCS_URL = "https://integrate.zivvy.xyz/docs";

type Props = {
  items: HubCardItem[];
};

export function IntegrationsHubPage({ items }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const availableCategories = useMemo<Category[]>(() => {
    const present = new Set<string>();
    for (const item of items) {
      if (item.category) present.add(item.category);
    }
    return CATEGORIES.filter((cat) => cat === "All" || present.has(cat));
  }, [items]);

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? items
        : items.filter((item) => item.category === activeCategory),
    [items, activeCategory]
  );

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-10 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center sm:pt-24">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  Integrations · API · webhooks
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Connect tools without losing the workflow
              </TextAnimate>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                Zivvy stays the system of record. Integrations notify, sync, and automate around
                the same owners, approvals, and audit trail.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="polished">
                  <a href={DOCS_URL} target="_blank" rel="noreferrer">
                    Read API docs
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={DOCS_URL} target="_blank" rel="noreferrer">
                    Explore API
                  </a>
                </Button>
              </div>
            </BlurFade>

            <BlurFade delay={0.1}>
              <div className="relative mx-auto flex h-[280px] w-full max-w-md items-center justify-center">
                <OrbitingCircles radius={110} iconSize={36} duration={22}>
                  {ORBIT_LABELS.slice(0, 4).map((label) => (
                    <span
                      key={label}
                      className="flex size-9 items-center justify-center rounded-full border border-border/70 bg-card text-[10px] font-semibold"
                    >
                      {label.slice(0, 2)}
                    </span>
                  ))}
                </OrbitingCircles>
                <OrbitingCircles radius={160} iconSize={32} duration={28} reverse>
                  {ORBIT_LABELS.slice(4).map((label) => (
                    <span
                      key={label}
                      className="flex size-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[10px] font-semibold text-primary"
                    >
                      {label.slice(0, 2)}
                    </span>
                  ))}
                </OrbitingCircles>
                <div className="absolute flex size-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary/15 font-display text-sm font-semibold text-primary">
                  Zivvy
                </div>
              </div>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-2">
          <BlurFade>
            <div className="grid gap-3 rounded-2xl border border-border/70 bg-card/50 p-5 sm:grid-cols-3 sm:p-6">
              <div className="rounded-xl border border-border/50 bg-background/50 px-4 py-5 text-center">
                <p className="font-display text-3xl font-semibold tracking-tight">
                  <NumberTicker value={130} />
                  <span className="text-primary">+</span>
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                  REST endpoints
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/50 px-4 py-5 text-center">
                <p className="font-display text-3xl font-semibold tracking-tight">
                  HMAC-signed
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                  Webhooks
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/50 px-4 py-5 text-center">
                <p className="font-display text-3xl font-semibold tracking-tight">
                  <NumberTicker value={100} />
                  <span className="text-primary">+</span>
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                  Event types
                </p>
              </div>
            </div>
          </BlurFade>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-3 pt-6">
          <BlurFade>
            <div className="flex flex-wrap items-center gap-2">
              {availableCategories.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border/60 bg-background/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </BlurFade>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 px-6 py-12 text-center text-sm text-muted-foreground">
              No integrations in this category yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item, index) => (
                <BlurFade key={item.slug} delay={0.04 + index * 0.04}>
                  <Link href={`/integrations/${item.slug}`} className="group block h-full">
                    <MagicCard
                      className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5"
                      gradientFrom="#34d399"
                      gradientTo="#0f766e"
                      gradientColor="rgba(27, 152, 114, 0.1)"
                    >
                      {index % 3 === 0 ? (
                        <BorderBeam size={55} duration={8} colorFrom="#34d399" colorTo="#0f766e" />
                      ) : null}
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background/70">
                          {index % 4 === 0 ? (
                            <Zap className="size-4 text-primary" />
                          ) : index % 4 === 1 ? (
                            <Cloud className="size-4 text-primary" />
                          ) : index % 4 === 2 ? (
                            <Webhook className="size-4 text-primary" />
                          ) : (
                            <Link2 className="size-4 text-primary" />
                          )}
                        </div>
                        {item.category ? (
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {item.category}
                          </Badge>
                        ) : null}
                      </div>
                      <h2 className="font-display text-lg font-semibold group-hover:text-primary">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        View integration
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </MagicCard>
                  </Link>
                </BlurFade>
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10">
          <BlurFade>
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Design principles
            </p>
          </BlurFade>
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/40 py-2">
            <Marquee pauseOnHover reverse className="[--duration:26s]">
              {PATTERN_CHIPS.map((chip) => (
                <div
                  key={chip}
                  className="mx-2 rounded-lg border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium shadow-sm"
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
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Building a custom connector?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Start from the API docs pattern, or talk through event contracts before you wire glue.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/contact">Plan integration</Link>
              </Button>
              <Button asChild variant="outline">
                <a href={DOCS_URL} target="_blank" rel="noreferrer">
                  Read docs
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
