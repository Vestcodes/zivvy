"use client";

import Link from "next/link";
import { ArrowRight, Map, Route } from "lucide-react";
import type { HubCardItem } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { AnimatedList } from "@/components/ui/animated-list";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { RetroGrid } from "@/components/ui/retro-grid";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";

const MIGRATION_STREAM = [
  "Map current tools → Zivvy modules",
  "Pilot one business unit",
  "Import customers & open orders",
  "Train owners on day-1 workflows",
  "Cut over reporting, then retire legacy"
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
          <RetroGrid className="opacity-30" />
          <div className="relative mx-auto max-w-4xl px-6 pb-10 pt-20 text-center sm:pt-24">
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
                Migration guides with workflow differences and rollout sequences — not feature bingo
                scorecards.
              </p>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item, index) => (
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
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Alternative path
                    </p>
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
            ))}
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
              Want a side-by-side first?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Compare capability rows, then come back for the migration sequence.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/compare">See comparisons</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Plan your migration</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
