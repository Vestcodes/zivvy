"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HubCardItem } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { RetroGrid } from "@/components/ui/retro-grid";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description: string;
  items: HubCardItem[];
  itemBasePath: string;
  ctaLabel?: string;
  ctaHref?: string;
  badge?: string;
  chips?: string[];
  children?: React.ReactNode;
};

export function MarketingHubPage({
  title,
  description,
  items,
  itemBasePath,
  ctaLabel = "Start free",
  ctaHref = "/login#signup",
  badge = "Browse · pick a path · start free",
  chips,
  children
}: Props) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <RetroGrid className="opacity-40" />
          <div className="relative mx-auto max-w-4xl px-6 pb-10 pt-20 text-center sm:pt-24">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  {badge}
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                {title}
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item, idx) => (
              <BlurFade key={item.slug} delay={0.03 + idx * 0.03}>
                <Link href={`${itemBasePath}/${item.slug}`} className="group block h-full">
                  <MagicCard
                    className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5"
                    gradientFrom="#34d399"
                    gradientTo="#0f766e"
                    gradientColor="rgba(27, 152, 114, 0.1)"
                  >
                    {idx === 0 ? (
                      <BorderBeam size={55} duration={7} colorFrom="#34d399" colorTo="#0f766e" />
                    ) : null}
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h2 className="mt-2 font-display text-lg font-semibold group-hover:text-primary">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                    <span
                      className={cn(
                        "mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                      )}
                    >
                      Open
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </MagicCard>
                </Link>
              </BlurFade>
            ))}
          </div>
        </section>

        {chips && chips.length > 0 ? (
          <section className="mx-auto max-w-5xl px-6 py-6">
            <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background/40 py-2">
              <Marquee pauseOnHover className="[--duration:28s]">
                {chips.map((chip) => (
                  <div
                    key={chip}
                    className="mx-2 rounded-lg border border-border/70 bg-card/80 px-4 py-2 text-sm font-medium shadow-sm"
                  >
                    {chip}
                  </div>
                ))}
              </Marquee>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-background to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-background to-transparent" />
            </div>
          </section>
        ) : null}

        {children}

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-4 sm:pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8 text-center">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Not sure where to start?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Open a free workspace, or tell us what you run today and we&apos;ll suggest a path.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Talk to us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
