"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Code2,
  Megaphone,
  Rocket,
  UsersRound
} from "lucide-react";
import type { HubCardItem } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

const SOLUTION_META: Record<
  string,
  {
    Icon: React.ElementType;
    className: string;
    background: React.ReactNode;
  }
> = {
  startups: {
    Icon: Rocket,
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedGridPattern
        numSquares={22}
        maxOpacity={0.1}
        className="absolute inset-0 fill-primary/10 stroke-primary/20 [mask-image:radial-gradient(340px_circle_at_10%_0%,white,transparent)]"
      />
    )
  },
  agencies: {
    Icon: Briefcase,
    className: "col-span-3 lg:col-span-1",
    background: <div className="absolute inset-0 bg-primary/5" />
  },
  enterprises: {
    Icon: Building2,
    className: "col-span-3 lg:col-span-1",
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
  "marketing-teams": {
    Icon: Megaphone,
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedGridPattern
        numSquares={14}
        maxOpacity={0.08}
        className="absolute inset-0 fill-primary/10 stroke-primary/15 [mask-image:linear-gradient(to_top,transparent_10%,white)]"
      />
    )
  },
  "hr-teams": {
    Icon: UsersRound,
    className: "col-span-3 lg:col-span-1",
    background: <div className="absolute inset-0 bg-muted/40" />
  },
  developers: {
    Icon: Code2,
    className: "col-span-3 lg:col-span-2",
    background: (
      <DotPattern
        className={cn(
          "absolute inset-0 text-primary/30",
          "[mask-image:radial-gradient(280px_circle_at_80%_20%,white,transparent)]"
        )}
      />
    )
  }
};

const CAPABILITY_CHIPS = [
  "Lead-to-cash",
  "Inventory",
  "Accounting",
  "HR & payroll",
  "Approvals",
  "Dashboards",
  "API & webhooks",
  "Multi-company"
];

type Props = {
  items: HubCardItem[];
};

export function SolutionsHubPage({ items }: Props) {
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
                  Solutions · by team · by stage
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Solutions for how you actually operate
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Pick the path that matches your team. Zivvy covers the workflows founders, agencies,
                enterprises, and specialists run every day.
              </p>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-4">
          <BlurFade delay={0.05}>
            <BentoGrid className="auto-rows-[13.5rem] lg:auto-rows-[15rem]">
              {items.map((item) => {
                const meta = SOLUTION_META[item.slug] ?? {
                  Icon: Rocket,
                  className: "col-span-3 lg:col-span-1",
                  background: <div className="absolute inset-0 bg-muted/30" />
                };
                return (
                  <BentoCard
                    key={item.slug}
                    name={item.title}
                    className={meta.className}
                    Icon={meta.Icon}
                    description={item.description}
                    href={`/solutions/${item.slug}`}
                    cta="Open solution"
                    background={meta.background}
                  />
                );
              })}
            </BentoGrid>
          </BlurFade>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10">
          <BlurFade>
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Capabilities inside every path
            </p>
          </BlurFade>
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background/40 py-2">
            <Marquee pauseOnHover className="[--duration:30s]">
              {CAPABILITY_CHIPS.map((chip) => (
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

        <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-10 md:grid-cols-2">
          <BlurFade>
            <MagicCard
              className="rounded-2xl border border-border/70 bg-card/70 p-6"
              gradientFrom="#34d399"
              gradientTo="#0f766e"
              gradientColor="rgba(27, 152, 114, 0.1)"
            >
              <h2 className="font-display text-xl font-semibold">Browse by job-to-be-done</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Prefer evaluating a concrete workflow first? Start with use cases.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link href="/use-cases">
                  Explore use cases
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
              <h2 className="font-display text-xl font-semibold">Browse by industry</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Manufacturing, SaaS, finance, healthcare, education — vertical context included.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link href="/industries">
                  Explore industries
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
              Not sure which path fits?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Tell us how you operate today — we&apos;ll map a practical starting point.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/contact">Talk with us</Link>
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
