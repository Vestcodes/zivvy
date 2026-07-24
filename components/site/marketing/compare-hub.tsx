"use client";

import Link from "next/link";
import { ArrowRight, GitCompareArrows, Scale } from "lucide-react";
import type { HubCardItem } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { RetroGrid } from "@/components/ui/retro-grid";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

const LENS_CHIPS = [
  "Pricing clarity",
  "Time to first value",
  "Operator UX",
  "Implementation weight",
  "Daily workflow fit",
  "Migration path"
];

type Props = {
  items: HubCardItem[];
};

function VsCard({ item, index }: { item: HubCardItem; index: number }) {
  const other = item.title.replace(/^Zivvy vs\s+/i, "").trim() || item.title;

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
          <RetroGrid className="opacity-35" />
          <div className="relative mx-auto max-w-4xl px-6 pb-10 pt-20 text-center sm:pt-24">
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
                Fair, factual comparisons
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Evaluate pricing model, operator UX, and time to value — then pick the fit for your
                next 6–12 months.
              </p>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-4">
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
              Want a recommendation for your stack?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Share what you run today. We&apos;ll map trade-offs without the sales theater.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/contact">Talk comparison</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/alternatives">See alternatives</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
