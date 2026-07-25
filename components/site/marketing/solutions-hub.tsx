"use client";

import dynamic from "next/dynamic";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

const BackgroundBeams = dynamic(
  () =>
    import("@/components/ui/aceternity/background-beams").then(
      (m) => m.BackgroundBeams
    ),
  { ssr: false }
);

const Timeline = dynamic(
  () => import("@/components/ui/aceternity/timeline").then((m) => m.Timeline),
  { ssr: false }
);

type Tier = "Free" | "Pro" | "Business";

const TIER_BADGE: Record<Tier, string> = {
  Free: "bg-muted text-foreground border-transparent",
  Pro: "bg-primary-gradient text-primary-foreground border-transparent",
  Business: "bg-foreground text-background border-transparent"
};

const SOLUTION_META: Record<
  string,
  {
    Icon: React.ElementType;
    className: string;
    background: React.ReactNode;
    category: string;
    tier: Tier;
  }
> = {
  startups: {
    Icon: Rocket,
    className: "col-span-3 lg:col-span-2",
    category: "Stage",
    tier: "Free",
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
    category: "Team",
    tier: "Pro",
    background: <div className="absolute inset-0 bg-primary/5" />
  },
  enterprises: {
    Icon: Building2,
    className: "col-span-3 lg:col-span-1",
    category: "Stage",
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
  "marketing-teams": {
    Icon: Megaphone,
    className: "col-span-3 lg:col-span-2",
    category: "Team",
    tier: "Pro",
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
    category: "Team",
    tier: "Pro",
    background: <div className="absolute inset-0 bg-muted/40" />
  },
  developers: {
    Icon: Code2,
    className: "col-span-3 lg:col-span-2",
    category: "Team",
    tier: "Pro",
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

type Stat = {
  value: number;
  suffix?: string;
  decimals?: number;
  label: string;
  sub: string;
};

const STATS: Stat[] = [
  {
    value: 12000,
    suffix: "+",
    label: "Tenants served",
    sub: "One tenant model. Auth, RBAC, and data isolation by default."
  },
  {
    value: 99.9,
    suffix: "%",
    decimals: 1,
    label: "Multi-region uptime",
    sub: "Regional deploys with automated failover. No hidden availability tiers."
  },
  {
    value: 420,
    suffix: "+",
    label: "REST endpoints",
    sub: "Every form is a REST resource. Every state change is a webhook event."
  }
];

type JourneyStage = {
  title: string;
  heading: string;
  body: string;
  bullets: string[];
};

const JOURNEY: JourneyStage[] = [
  {
    title: "Research",
    heading: "Trace every resource before you migrate.",
    body: "Every capability is a REST endpoint, a webhook event, and a form. Read the tenant model before you commit — no gated docs, no NDA.",
    bullets: [
      "Open API reference at integrate.zivvy.xyz/docs",
      "Sandbox tenant with seeded data",
      "Compare tables in /compare"
    ]
  },
  {
    title: "Migrate",
    heading: "Cut over the incumbent one workflow at a time.",
    body: "Bring your existing customers, invoices, and open orders. Pilot one business unit — the rest follows the same import path.",
    bullets: [
      "CSV + REST-based import for every doctype",
      "Dry-run migrations with rollback",
      "Written cut-over sequence per incumbent"
    ]
  },
  {
    title: "Automate",
    heading: "Wire webhooks to the tools you already run.",
    body: "Every state change fires a webhook. Route it to Slack, your ledger, or a queue — the same event on every tier.",
    bullets: [
      "Signed webhooks with replay + retries",
      "Per-tenant subscription topics",
      "Approvals and roles inline, not bolted on"
    ]
  },
  {
    title: "Scale",
    heading: "Turn on manufacturing, quality, and assets when ready.",
    body: "Same tenant, same auth boundary. Business-tier modules turn on by plan — not by spinning up another instance.",
    bullets: [
      "Multi-region deploys with automated failover",
      "Per-tenant audit trails and row-level RBAC",
      "Manufacturing-grade BOMs and work orders"
    ]
  }
];

function JourneyContent({ stage }: { stage: JourneyStage }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 p-6">
      <h4 className="font-display text-lg font-semibold text-foreground sm:text-xl">
        {stage.heading}
      </h4>
      <p className="mt-2 text-sm text-muted-foreground">{stage.body}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {stage.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-foreground/90">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Props = {
  items: HubCardItem[];
};

export function SolutionsHubPage({ items }: Props) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-background">
          <div className="absolute inset-0 -z-10 opacity-70">
            <BackgroundBeams />
          </div>
          <div className="relative mx-auto max-w-5xl px-6 pb-6 pt-24 text-center sm:pt-28">
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
                One tenant. Every team.
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Every team shares one tenant, one auth boundary, and one webhook stream. Roles and
                dashboards adapt to how each team operates.
              </p>
            </BlurFade>
          </div>

          <div className="relative mx-auto mt-10 max-w-5xl px-6 pb-8">
            <div className="grid gap-3 sm:grid-cols-3">
              {STATS.map((stat, idx) => (
                <BlurFade key={stat.label} delay={0.06 + idx * 0.06}>
                  <MagicCard
                    className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5 text-left"
                    gradientFrom="#34d399"
                    gradientTo="#0f766e"
                    gradientColor="rgba(27, 152, 114, 0.1)"
                  >
                    <div className="flex items-baseline gap-1">
                      <NumberTicker
                        value={stat.value}
                        decimalPlaces={stat.decimals ?? 0}
                        className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
                      />
                      {stat.suffix ? (
                        <span className="font-display text-2xl font-semibold text-primary sm:text-3xl">
                          {stat.suffix}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-medium">{stat.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
                  </MagicCard>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        <section className="relative">
          <div className="mx-auto max-w-6xl px-6 pt-8 text-center">
            <BlurFade>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                The solution-adoption journey
              </p>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Research → Migrate → Automate → Scale
              </h2>
            </BlurFade>
          </div>
          <Timeline
            hideDefaultHeader
            data={JOURNEY.map((stage) => ({
              title: stage.title,
              content: <JourneyContent stage={stage} />
            }))}
          />
        </section>

        <section className="relative mx-auto max-w-6xl px-6 pb-4 pt-6">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-4 sm:p-6">
            <DotPattern
              className={cn(
                "pointer-events-none absolute inset-0 -z-10 text-primary/25",
                "[mask-image:radial-gradient(560px_circle_at_50%_0%,white,transparent)]"
              )}
            />
            <BlurFade delay={0.05}>
              <BentoGrid className="auto-rows-[13.5rem] lg:auto-rows-[15rem]">
                {items.map((item) => {
                  const meta = SOLUTION_META[item.slug] ?? {
                    Icon: Rocket,
                    className: "col-span-3 lg:col-span-1",
                    category: "Team",
                    tier: "Pro" as Tier,
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
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-6 pt-10 md:grid-cols-2">
          <BlurFade>
            <MagicCard
              className="rounded-2xl border border-border/70 bg-card/70 p-6"
              gradientFrom="#34d399"
              gradientTo="#0f766e"
              gradientColor="rgba(27, 152, 114, 0.1)"
            >
              <h2 className="font-display text-xl font-semibold">Browse by job-to-be-done</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Prefer evaluating a concrete workflow first? Each use case lists the REST resources
                and webhook events it touches.
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
                Same tenant model — different defaults for healthcare, SaaS, finance,
                manufacturing, and education.
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
              Want a role-shaped starter?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              We&apos;ll seed a tenant with the right dashboards, roles, and webhook subscriptions
              for how your team already operates.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/contact">Get a seeded tenant</Link>
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
