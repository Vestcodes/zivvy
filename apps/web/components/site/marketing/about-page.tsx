"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ShineBorder } from "@/components/ui/shine-border";
import {
  BentoGrid,
  BentoGridItem,
  TextGenerateEffect,
  Timeline
} from "@/components/ui/aceternity";

const VALUES = [
  {
    title: "Operator-first design",
    body: "We optimize for people running real workflows every day, not just software buyers."
  },
  {
    title: "Clarity over complexity",
    body: "We ship focused product decisions that reduce confusion and speed up execution."
  },
  {
    title: "Trust through transparency",
    body: "Pricing, roadmap, and product behavior should be legible before and after purchase."
  }
];

/**
 * "By the numbers" — conservative, defensible placeholders. Each row is
 * split into a numeric value (rendered with <NumberTicker>) and a
 * separate suffix so the ticker animates cleanly.
 */
const NUMBERS: {
  value: number;
  suffix?: string;
  label: string;
  sub: string;
}[] = [
  { value: 3, label: "regions", sub: "India · EU · US" },
  {
    value: 20,
    suffix: " min",
    label: "typical setup",
    sub: "from signup to first invoice"
  },
  {
    value: 130,
    suffix: "+",
    label: "REST endpoints",
    sub: "full-surface API"
  },
  { value: 0, label: "forced modules", sub: "turn on what you use" }
];

const MILESTONES: { title: string; content: React.ReactNode }[] = [
  {
    title: "2026",
    content: (
      <div>
        <h4 className="mb-2 font-display text-base font-semibold text-foreground sm:text-lg">
          Zivvy launches.
        </h4>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Owner-first ERP goes live with three regions, seat-based pricing,
          and a free forever plan. Sales, CRM, stock, and accounting all
          ship on day one.
        </p>
      </div>
    )
  },
  {
    title: "H1 2026",
    content: (
      <div>
        <h4 className="mb-2 font-display text-base font-semibold text-foreground sm:text-lg">
          Integrations foundation.
        </h4>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          HMAC-signed webhooks, per-tenant API keys, and a 130+ endpoint
          REST surface. Add-ons for commerce sync and DATEV export land
          in the same window.
        </p>
      </div>
    )
  },
  {
    title: "H2 2026",
    content: (
      <div>
        <h4 className="mb-2 font-display text-base font-semibold text-foreground sm:text-lg">
          Manufacturing + assets.
        </h4>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          BOMs, work orders, and asset lifecycles for teams on the
          Business plan. Batch payments and in-ERP signing move out of
          beta.
        </p>
      </div>
    )
  },
  {
    title: "2027",
    content: (
      <div>
        <h4 className="mb-2 font-display text-base font-semibold text-foreground sm:text-lg">
          Self-host on Business.
        </h4>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          A packaged self-host artifact for regulated teams that need
          fully in-boundary infrastructure — same product, same API,
          your metal.
        </p>
      </div>
    )
  }
];

export function AboutPageContent() {
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
                "radial-gradient(ellipse 70% 60% at 40% -10%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 75%)"
            }}
          />
          <div className="relative mx-auto max-w-4xl px-6 pb-8 pt-20 sm:pt-24">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  About · mission · values
                </AnimatedShinyText>
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                About Zivvy
              </h1>
              <TextGenerateEffect
                words="Zivvy exists to help teams run sales, finance, and operations from one clean workflow system that actually gets adopted."
                className="mt-5 max-w-3xl [&_div>div]:text-lg [&_div>div]:font-normal [&_span]:text-muted-foreground sm:[&_div>div]:text-xl"
              />
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-6">
          <BlurFade>
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8">
              <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
              <h2 className="font-display text-2xl font-semibold">Our story</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                We built Zivvy for teams stuck between lightweight tools that break at scale and
                heavyweight suites that slow execution. The goal is simple: make serious business
                workflows usable, measurable, and reliable from day one — with pricing that matches
                when you turn modules on, not when a salesperson closes a deck.
              </p>
            </div>
          </BlurFade>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-6" aria-labelledby="about-mission">
          <BlurFade>
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8">
              <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={16} />
              <h2 id="about-mission" className="font-display text-2xl font-semibold">
                Mission
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Owner-first ERP for teams that outgrew spreadsheets but should not have to
                buy an enterprise suite. Every workspace is tenant-isolated by default — your
                data, your regional boundary, your keys. And nothing on Zivvy is a black box:
                a real API, signed webhooks and an event log make it integrable with whatever
                stack you already run.
              </p>
              <ul className="mt-5 grid gap-2 text-sm text-foreground/90 sm:grid-cols-3">
                <li className="rounded-lg border border-border/60 bg-background/60 px-3 py-2">
                  <span className="font-medium">Owner-first</span> — priced and shaped for
                  the person who signs the invoices.
                </li>
                <li className="rounded-lg border border-border/60 bg-background/60 px-3 py-2">
                  <span className="font-medium">Tenant-isolated</span> — per-workspace data
                  boundary and API keys, cross-tenant leaks are structurally impossible.
                </li>
                <li className="rounded-lg border border-border/60 bg-background/60 px-3 py-2">
                  <span className="font-medium">Integrable</span> — 130+ REST endpoints,
                  HMAC-signed webhooks, replayable event log.
                </li>
              </ul>
            </div>
          </BlurFade>
        </section>

        <section
          className="mx-auto max-w-6xl px-6 py-10"
          aria-labelledby="about-numbers"
        >
          <BlurFade>
            <h2
              id="about-numbers"
              className="font-display text-3xl font-semibold tracking-tight"
            >
              By the numbers
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A few honest metrics — we&apos;ll update them as the product grows.
            </p>
          </BlurFade>
          <BentoGrid className="mt-6 max-w-none grid-cols-1 gap-4 md:auto-rows-[14rem] md:grid-cols-2 lg:grid-cols-4">
            {NUMBERS.map((stat, index) => (
              <BentoGridItem
                key={stat.label}
                className="relative border-border/70 bg-card/60 dark:bg-card/40"
                header={
                  <div className="flex h-full flex-col justify-end">
                    <div className="font-display text-5xl font-bold tabular-nums tracking-tight text-foreground sm:text-6xl">
                      <NumberTicker
                        value={stat.value}
                        delay={0.1 + index * 0.05}
                        className="text-foreground dark:text-foreground"
                      />
                      {stat.suffix ? (
                        <span className="text-foreground">{stat.suffix}</span>
                      ) : null}
                    </div>
                  </div>
                }
                title={
                  <span className="text-base font-semibold text-foreground">
                    {stat.label}
                  </span>
                }
                description={
                  <span className="text-xs text-muted-foreground">
                    {stat.sub}
                  </span>
                }
              />
            ))}
          </BentoGrid>
        </section>

        <section
          className="relative"
          aria-labelledby="about-timeline"
        >
          <div className="mx-auto max-w-6xl px-6 pt-10">
            <BlurFade>
              <h2
                id="about-timeline"
                className="font-display text-3xl font-semibold tracking-tight"
              >
                Milestones
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Where the product has been and where it&apos;s going next — kept
                honest and dated.
              </p>
            </BlurFade>
          </div>
          {/*
            <Timeline> renders its own container padding + heading and a
            hard-coded background. We hide the built-in header and
            re-transparent the background via child selectors so the
            component reads as part of the page.
          */}
          <div className="[&>div]:!bg-transparent [&>div>div:first-child]:hidden">
            <Timeline data={MILESTONES} />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10">
          <BlurFade>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Values</h2>
          </BlurFade>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {VALUES.map((value, index) => (
              <BlurFade key={value.title} delay={0.04 + index * 0.04}>
                <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5">
                  <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={16} />
                  <h3 className="font-display text-xl font-semibold">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{value.body}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-8 text-center">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">Build with us</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Looking for support, partnerships, or rollout guidance? We&apos;re happy to help.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/contact">
                  Contact us
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/careers">Careers</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
