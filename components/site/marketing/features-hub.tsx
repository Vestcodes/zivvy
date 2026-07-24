"use client";

import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Barcode,
  Boxes,
  Factory,
  Handshake,
  LineChart,
  PackageSearch,
  Receipt,
  ScanLine,
  ShieldCheck,
  UsersRound,
  Workflow
} from "lucide-react";
import type { HubCardItem } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { ShineBorder } from "@/components/ui/shine-border";
import { SparklesText } from "@/components/ui/sparkles-text";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    tier: "Free",
    tagline: "Start selling. Track basics.",
    features: [
      { icon: Receipt, title: "Quotes & sales orders", desc: "Send professional quotes, convert to orders in one click." },
      { icon: Handshake, title: "CRM lite", desc: "Leads, contacts, opportunities. Simple pipeline." },
      { icon: PackageSearch, title: "Basic stock", desc: "Items, warehouses, and stock levels. No serial/batch." }
    ]
  },
  {
    tier: "Pro",
    tagline: "Run a real business. All the essentials.",
    features: [
      { icon: Banknote, title: "Accounting & tax", desc: "Books, GST/VAT, invoices, payments, reconciliation." },
      { icon: Boxes, title: "Full stock", desc: "Warehouses, batches, serials, transfers, reconciliation." },
      { icon: UsersRound, title: "HR & payroll", desc: "Employees, attendance, leave, salary structures." },
      { icon: Barcode, title: "Barcode workflows", desc: "Scan-driven picking, receiving, and cycle counts." },
      { icon: Workflow, title: "Projects", desc: "Tasks, timesheets, budgets, gantt. Stay on top of delivery." },
      { icon: LineChart, title: "Reports & dashboards", desc: "The reports you actually need, out of the box." }
    ]
  },
  {
    tier: "Business",
    tagline: "Scale operations. Manufacturing-grade.",
    features: [
      { icon: Factory, title: "Manufacturing & BOMs", desc: "Multi-level BOMs, work orders, job cards, shop floor." },
      { icon: ScanLine, title: "Assets", desc: "Fixed assets, depreciation, maintenance, movements." },
      { icon: ShieldCheck, title: "Quality", desc: "Inspection templates, holds, non-conformance workflows." },
      { icon: Workflow, title: "Subcontracting", desc: "Work with vendors on components, track their WIP." }
    ]
  }
];

const TIER_BADGE: Record<string, string> = {
  Free: "bg-muted text-foreground border-transparent",
  Pro: "bg-primary-gradient text-primary-foreground border-transparent",
  Business: "bg-foreground text-background border-transparent"
};

const CAPABILITY_CHIPS = [
  "Lead-to-cash",
  "Stock & batches",
  "Accounting",
  "Payroll",
  "Manufacturing",
  "Quality",
  "API",
  "Dashboards"
];

type Props = {
  deepDives: HubCardItem[];
};

export function FeaturesHubPage({ deepDives }: Props) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <AnimatedGridPattern
            numSquares={30}
            maxOpacity={0.1}
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 fill-primary/10 stroke-primary/15",
              "[mask-image:radial-gradient(520px_circle_at_50%_-10%,white,transparent)]"
            )}
          />
          <div className="relative mx-auto max-w-4xl px-6 pb-8 pt-20 text-center sm:pt-24">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  Features · Free · Pro · Business
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Everything, without the enterprise pain
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                One product, three tiers. Capabilities are in the product from day one — you pay for
                what you turn on.
              </p>
              <div className="mt-6">
                <SparklesText
                  className="font-display text-xl font-semibold tracking-tight text-primary sm:text-2xl"
                  colors={{ first: "#34d399", second: "#0f766e" }}
                >
                  Seat-based. Region-aware. Operator-first.
                </SparklesText>
              </div>
            </BlurFade>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-6 pb-10 pt-4">
          {TIERS.map(({ tier, tagline, features }, tierIdx) => (
            <BlurFade key={tier} delay={0.04 + tierIdx * 0.05}>
              <div className="mt-14 first:mt-0">
                <div className="mb-6 flex flex-wrap items-baseline gap-3">
                  <Badge className={TIER_BADGE[tier]}>{tier}</Badge>
                  <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {tagline}
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {features.map(({ icon: Icon, title, desc }, idx) => (
                    <MagicCard
                      key={title}
                      className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5"
                      gradientFrom="#34d399"
                      gradientTo="#0f766e"
                      gradientColor="rgba(27, 152, 114, 0.08)"
                    >
                      {tierIdx === 1 && idx === 0 ? (
                        <BorderBeam size={55} duration={7} colorFrom="#34d399" colorTo="#0f766e" />
                      ) : null}
                      <Icon className="size-5 text-primary" />
                      <h3 className="mt-3 font-display text-base font-semibold">{title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                    </MagicCard>
                  ))}
                </div>
              </div>
            </BlurFade>
          ))}
        </div>

        <section className="mx-auto max-w-6xl px-6 py-8">
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

        <section className="mx-auto max-w-6xl px-6 pb-10 pt-4">
          <BlurFade>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Feature deep-dives
            </h2>
            <p className="mt-2 text-muted-foreground">
              Focused pages for capabilities buyers usually evaluate one-by-one.
            </p>
          </BlurFade>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deepDives.map((feature, index) => (
              <BlurFade key={feature.slug} delay={0.03 + index * 0.03}>
                <Link href={`/features/${feature.slug}`} className="group block h-full">
                  <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5 transition-colors hover:bg-accent/30">
                    {index === 0 ? (
                      <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
                    ) : null}
                    <h3 className="font-display text-lg font-semibold group-hover:text-primary">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      Explore feature
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </BlurFade>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-4 text-center sm:pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">Ready to try Zivvy?</h2>
            <p className="mt-3 text-muted-foreground">
              Free plan, 2 seats. No credit card. Change your mind whenever.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished" size="lg">
                <Link href="/login#signup">Start free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
