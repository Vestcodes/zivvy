"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";

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

const PRINCIPLES = [
  "No vanity metrics",
  "Seat-based pricing",
  "Region choice",
  "Self-host on Business",
  "Honest roadmap",
  "Free forever plan"
];

/**
 * "By the numbers" — kept intentionally conservative. These are safe,
 * defensible placeholders; do not pump them up. When accurate figures land,
 * update `value` and `label` here.
 */
const NUMBERS = [
  { value: "3", label: "regions", sub: "India · EU · US" },
  { value: "20 min", label: "typical setup", sub: "from signup to first invoice" },
  { value: "130+", label: "REST endpoints", sub: "full-surface API" },
  { value: "0", label: "forced modules", sub: "turn on what you use" }
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
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                About Zivvy
              </TextAnimate>
              <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
                Zivvy exists to help teams run sales, finance, and operations from one clean
                workflow system that actually gets adopted.
              </p>
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
          className="mx-auto max-w-6xl px-6 py-8"
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
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {NUMBERS.map((stat, index) => (
              <BlurFade key={stat.label} delay={0.04 + index * 0.04}>
                <div className="relative h-full rounded-2xl border border-border/70 bg-card/60 p-5">
                  <div className="font-display text-3xl font-bold tabular-nums tracking-tight">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm font-medium">{stat.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{stat.sub}</div>
                </div>
              </BlurFade>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8">
          <BlurFade>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Values</h2>
          </BlurFade>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {VALUES.map((value, index) => (
              <BlurFade key={value.title} delay={0.04 + index * 0.04}>
                <MagicCard
                  className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5"
                  gradientFrom="#34d399"
                  gradientTo="#0f766e"
                  gradientColor="rgba(27, 152, 114, 0.1)"
                >
                  {index === 0 ? (
                    <BorderBeam size={50} duration={7} colorFrom="#34d399" colorTo="#0f766e" />
                  ) : null}
                  <h3 className="font-display text-xl font-semibold">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{value.body}</p>
                </MagicCard>
              </BlurFade>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-6">
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/40 py-2">
            <Marquee pauseOnHover className="[--duration:28s]">
              {PRINCIPLES.map((item) => (
                <div
                  key={item}
                  className="mx-2 rounded-lg border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium shadow-sm"
                >
                  {item}
                </div>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-background to-transparent" />
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
