"use client";

import Link from "next/link";
import { ArrowRight, HeartHandshake, Sparkles, UsersRound } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { SparklesText } from "@/components/ui/sparkles-text";
import { TextAnimate } from "@/components/ui/text-animate";

const PILLARS = [
  {
    Icon: UsersRound,
    title: "Operator empathy",
    body: "We hire people who have felt the pain of broken handoffs — and want to fix the product, not the deck."
  },
  {
    Icon: Sparkles,
    title: "Craft over theater",
    body: "Ship clear UI, honest pricing, and workflows that survive a real Tuesday afternoon."
  },
  {
    Icon: HeartHandshake,
    title: "Small team, high trust",
    body: "Open roles appear when we have real work — not when we need vanity headcount."
  }
];

export function CareersPageContent() {
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
                "radial-gradient(ellipse 70% 60% at 50% -10%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 75%)"
            }}
          />
          <div className="relative mx-auto max-w-3xl px-6 pb-10 pt-24 text-center sm:pt-28">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  Careers · build with us
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Careers at Zivvy
              </TextAnimate>
              <p className="mt-4 text-lg text-muted-foreground">
                We&apos;re building a product teams actually enjoy running their business on.
              </p>
              <div className="mt-6">
                <SparklesText
                  className="font-display text-xl font-semibold text-primary sm:text-2xl"
                  colors={{ first: "#34d399", second: "#0f766e" }}
                >
                  Roles open when the work is real.
                </SparklesText>
              </div>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-10">
          <div className="grid gap-4 md:grid-cols-3">
            {PILLARS.map((pillar, index) => (
              <BlurFade key={pillar.title} delay={0.05 + index * 0.05}>
                <MagicCard
                  className="h-full rounded-2xl border border-border/70 bg-card/70 p-5"
                  gradientFrom="#34d399"
                  gradientTo="#0f766e"
                  gradientColor="rgba(27, 152, 114, 0.1)"
                >
                  <pillar.Icon className="size-5 text-primary" />
                  <h2 className="mt-3 font-display text-lg font-semibold">{pillar.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{pillar.body}</p>
                </MagicCard>
              </BlurFade>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 text-center">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Interested anyway?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Open roles are published periodically. Share your profile and what you want to build.
            </p>
            <div className="mt-6">
              <Button asChild variant="polished" size="lg">
                <Link href="/contact">
                  Apply via contact
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
