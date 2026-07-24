"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  LifeBuoy,
  Map,
  Rocket,
  ScrollText
} from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { AnimatedList } from "@/components/ui/animated-list";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";

const SUPPORT_LINKS = [
  {
    title: "Documentation",
    href: "/support/docs",
    description: "Getting started, API references, tutorials, and troubleshooting.",
    Icon: BookOpen
  },
  {
    title: "Help center",
    href: "/support/help-center",
    description: "Answers for billing, account management, security, and technical issues.",
    Icon: LifeBuoy
  },
  {
    title: "Changelog",
    href: "/support/changelog",
    description: "See the latest feature launches, improvements, and fixes.",
    Icon: ScrollText
  },
  {
    title: "Roadmap",
    href: "/support/roadmap",
    description: "What we are building now, next, and later.",
    Icon: Map
  }
];

const STREAM = [
  "Invite teammates → assign roles",
  "Import customers → first quote",
  "Connect payments → reconcile",
  "Open a support ticket → resolve"
];

export function SupportHubPage() {
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
          <div className="relative mx-auto max-w-4xl px-6 pb-8 pt-20 text-center sm:pt-24">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <Rocket className="size-3.5 text-primary" />
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  Support · docs · changelog · roadmap
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Get unblocked fast
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Self-serve docs and honest product updates — plus a human path when you need one.
              </p>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {SUPPORT_LINKS.map((item, index) => (
              <BlurFade key={item.href} delay={0.04 + index * 0.04}>
                <Link href={item.href} className="group block h-full">
                  <MagicCard
                    className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5"
                    gradientFrom="#34d399"
                    gradientTo="#0f766e"
                    gradientColor="rgba(27, 152, 114, 0.1)"
                  >
                    {index === 0 ? (
                      <BorderBeam size={55} duration={7} colorFrom="#34d399" colorTo="#0f766e" />
                    ) : null}
                    <item.Icon className="size-5 text-primary" />
                    <h2 className="mt-3 font-display text-lg font-semibold group-hover:text-primary">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      Open
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </MagicCard>
                </Link>
              </BlurFade>
            ))}
          </div>

          <BlurFade delay={0.1}>
            <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5">
              <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Common first paths
              </p>
              <div className="mt-4 min-h-[14rem]">
                <AnimatedList delay={1200} className="gap-2">
                  {STREAM.map((step) => (
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

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-4 text-center">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">Still stuck?</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Tell us what you&apos;re trying to finish — we&apos;ll point to the right doc or help path.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/contact">Contact support</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/security">Security overview</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
