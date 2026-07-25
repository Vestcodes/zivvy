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
  Webhook,
  Workflow
} from "lucide-react";
import type { HubCardItem } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

type Tier = "Free" | "Pro" | "Business";

type FeatureRow = {
  icon: React.ElementType;
  title: string;
  desc: string;
  category: string;
};

const TIERS: { tier: Tier; tagline: string; features: FeatureRow[] }[] = [
  {
    tier: "Free",
    tagline: "Start selling. Track basics.",
    features: [
      {
        icon: Receipt,
        title: "Quotes & sales orders",
        desc: "REST /quotes and /sales-orders with a matching form. One-click convert.",
        category: "Sales"
      },
      {
        icon: Handshake,
        title: "CRM lite",
        desc: "Leads, contacts, opportunities. Webhook lead.created fires on every capture.",
        category: "CRM"
      },
      {
        icon: PackageSearch,
        title: "Basic stock",
        desc: "Items and warehouses in one tenant. Levels via /stock-levels. No serial/batch.",
        category: "Stock"
      }
    ]
  },
  {
    tier: "Pro",
    tagline: "Run a real business. All the essentials.",
    features: [
      {
        icon: Banknote,
        title: "Accounting & tax",
        desc: "Books, GST/VAT, /invoices, /payments, reconciliation — with payment.settled events.",
        category: "Finance"
      },
      {
        icon: Boxes,
        title: "Full stock",
        desc: "Warehouses, batches, serials, transfers. stock.moved and stock.reconciled webhooks.",
        category: "Stock"
      },
      {
        icon: UsersRound,
        title: "HR & payroll",
        desc: "Employees, attendance, leave, salary structures. All under /hr resources.",
        category: "HR"
      },
      {
        icon: Barcode,
        title: "Barcode workflows",
        desc: "Scan-driven picking, receiving, cycle counts. Same tenant, same auth boundary.",
        category: "Stock"
      },
      {
        icon: Workflow,
        title: "Projects",
        desc: "Tasks, timesheets, budgets, gantt. /projects with task.status.changed events.",
        category: "Ops"
      },
      {
        icon: LineChart,
        title: "Reports & dashboards",
        desc: "The reports you actually need — powered by the same REST resources as the forms.",
        category: "Insights"
      }
    ]
  },
  {
    tier: "Business",
    tagline: "Scale operations. Manufacturing-grade.",
    features: [
      {
        icon: Factory,
        title: "Manufacturing & BOMs",
        desc: "Multi-level BOMs, work orders, job cards, shop floor — one tenant, one API.",
        category: "Ops"
      },
      {
        icon: ScanLine,
        title: "Assets",
        desc: "Fixed assets, depreciation, maintenance. asset.moved and asset.depreciated events.",
        category: "Finance"
      },
      {
        icon: ShieldCheck,
        title: "Quality",
        desc: "Inspection templates, holds, non-conformance flows. Webhook: quality.hold.raised.",
        category: "Ops"
      },
      {
        icon: Workflow,
        title: "Subcontracting",
        desc: "Vendor components with WIP tracking. Every step is a REST resource + form + event.",
        category: "Ops"
      }
    ]
  }
];

const TIER_BADGE: Record<Tier, string> = {
  Free: "bg-muted text-foreground border-transparent",
  Pro: "bg-primary-gradient text-primary-foreground border-transparent",
  Business: "bg-foreground text-background border-transparent"
};

const DEEP_DIVE_META: Record<string, { category: string; tier: Tier }> = {
  "ai-automation": { category: "Automation", tier: "Business" },
  "reporting-dashboard": { category: "Insights", tier: "Pro" },
  "team-collaboration": { category: "Team", tier: "Free" },
  analytics: { category: "Insights", tier: "Pro" },
  api: { category: "Developer", tier: "Free" },
  "workflow-builder": { category: "Automation", tier: "Business" }
};

const CAPABILITY_CHIPS = [
  "REST resources",
  "Webhook events",
  "Forms",
  "Approvals",
  "Roles & scopes",
  "Multi-tenant",
  "Region tax",
  "Dashboards"
];

type Props = {
  deepDives: HubCardItem[];
};

function MockBrowserFrame() {
  return (
    <div className="relative mx-auto mt-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-border/70 bg-card/70 shadow-lg shadow-primary/5">
      <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={16} />
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-border/60 bg-background/60 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-red-400/70" />
        <span className="size-2.5 rounded-full bg-amber-400/70" />
        <span className="size-2.5 rounded-full bg-emerald-400/70" />
        <div className="ml-3 flex flex-1 items-center gap-2 rounded-md border border-border/50 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
          <span className="text-primary">https://</span>
          <span>app.zivvy.xyz</span>
          <span className="text-muted-foreground/60">/dashboard</span>
        </div>
      </div>
      {/* mock dashboard content */}
      <div className="grid gap-3 p-4 sm:grid-cols-3">
        <div className="col-span-3 flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <Webhook className="size-3.5 text-primary" />
            <span className="font-mono text-muted-foreground">
              POST /webhooks · invoice.settled
            </span>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            200 OK
          </span>
        </div>
        {[
          { label: "Open quotes", value: "48" },
          { label: "Stock alerts", value: "6" },
          { label: "AR outstanding", value: "$92k" }
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/60 bg-background/60 p-3"
          >
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 font-display text-lg font-semibold">{stat.value}</p>
          </div>
        ))}
        <div className="col-span-3 rounded-xl border border-border/60 bg-background/50 p-3">
          <div className="flex items-end gap-1.5">
            {[38, 62, 44, 71, 58, 82, 54, 66, 74, 48, 61, 79].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-primary/70"
                style={{ height: `${h}%`, minHeight: 4 }}
              />
            ))}
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
            /reports/cash-in · last 12 weeks
          </p>
        </div>
      </div>
    </div>
  );
}

export function FeaturesHubPage({ deepDives }: Props) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <DotPattern
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 text-primary/25",
              "[mask-image:radial-gradient(560px_circle_at_50%_-10%,white,transparent)]"
            )}
          />
          <div className="relative mx-auto max-w-5xl px-6 pb-4 pt-20 text-center sm:pt-24">
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
                Every capability, one tenant
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Every capability is a REST endpoint, a webhook event, and a form in the same
                tenant. You pay for what you turn on — not for another SKU.
              </p>
            </BlurFade>
            <BlurFade delay={0.08}>
              <MockBrowserFrame />
            </BlurFade>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-6 pb-10 pt-10">
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
                  {features.map(({ icon: Icon, title, desc, category }, idx) => (
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
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <Icon className="size-5 text-primary" />
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {category}
                          </Badge>
                          <Badge className={cn("text-[10px]", TIER_BADGE[tier])}>{tier}</Badge>
                        </div>
                      </div>
                      <h3 className="mt-1 font-display text-base font-semibold">{title}</h3>
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
              Focused pages for capabilities buyers usually evaluate one-by-one — each with its
              REST resources and webhook events called out.
            </p>
          </BlurFade>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deepDives.map((feature, index) => {
              const meta = DEEP_DIVE_META[feature.slug] ?? { category: "Platform", tier: "Pro" as Tier };
              return (
                <BlurFade key={feature.slug} delay={0.03 + index * 0.03}>
                  <Link href={`/features/${feature.slug}`} className="group block h-full">
                    <MagicCard
                      className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5"
                      gradientFrom="#34d399"
                      gradientTo="#0f766e"
                      gradientColor="rgba(27, 152, 114, 0.08)"
                    >
                      <div className="mb-3 flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] font-medium">
                          {meta.category}
                        </Badge>
                        <Badge className={cn("text-[10px]", TIER_BADGE[meta.tier])}>
                          {meta.tier}
                        </Badge>
                      </div>
                      <h3 className="font-display text-lg font-semibold group-hover:text-primary">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        Explore feature
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </MagicCard>
                  </Link>
                </BlurFade>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-4 text-center sm:pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Prefer the raw API surface?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every form on this page is a REST resource and a webhook event. Read the API docs, or
              start free and turn features on as you go.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished" size="lg">
                <Link href="/login#signup">Start free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/support/docs">Read API docs</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
