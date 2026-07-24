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
