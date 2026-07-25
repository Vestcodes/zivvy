"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
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
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { ShineBorder } from "@/components/ui/shine-border";
import { cn } from "@/lib/utils";

const Spotlight = dynamic(
  () => import("@/components/ui/aceternity/spotlight").then((m) => m.Spotlight),
  { ssr: false }
);

const TextGenerateEffect = dynamic(
  () =>
    import("@/components/ui/aceternity/text-generate-effect").then(
      (m) => m.TextGenerateEffect
    ),
  { ssr: false }
);

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

const PRINCIPLE_CHIPS = [
  "REST-first",
  "Webhook-first",
  "Single tenant",
  "Roles by scope",
  "Region defaults",
  "Zero add-on SKUs",
  "Forms match API",
  "Audit by default",
  "Approvals inline",
  "Deterministic IDs"
];

type Props = {
  deepDives: HubCardItem[];
};

/**
 * Icon-based focus grid — hovered card lifts + brightens, siblings blur + soften.
 * Same interaction contract as Aceternity's FocusCards, adapted for icon content.
 */
function FocusFeatureGrid({
  features,
  tier
}: {
  features: FeatureRow[];
  tier: Tier;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map(({ icon: Icon, title, desc, category }, idx) => (
        <div
          key={title}
          onMouseEnter={() => setHovered(idx)}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5 transition-all duration-300 ease-out",
            hovered !== null && hovered !== idx && "scale-[0.98] opacity-60 blur-[1px]",
            hovered === idx &&
              "-translate-y-0.5 border-primary/40 shadow-lg shadow-primary/10 bg-card/90"
          )}
        >
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
              hovered === idx && "opacity-100"
            )}
            style={{
              background:
                "radial-gradient(320px circle at 20% 0%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 60%)"
            }}
          />
          <div className="relative">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg border border-border/60 bg-background/70 transition-colors",
                  hovered === idx && "border-primary/40 bg-primary/10"
                )}
              >
                <Icon className="size-4 text-primary" />
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] font-medium">
                  {category}
                </Badge>
                <Badge className={cn("text-[10px]", TIER_BADGE[tier])}>{tier}</Badge>
              </div>
            </div>
            <h3 className="mt-1 font-display text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeaturesHubPage({ deepDives }: Props) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative">
          <Spotlight
            className="relative w-full"
            fill="color-mix(in oklab, var(--primary) 45%, transparent)"
          >
            <div className="relative mx-auto max-w-5xl px-6 pb-6 pt-20 text-center sm:pt-24">
              <BlurFade>
                <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                  <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                    Features · Free · Pro · Business
                  </AnimatedShinyText>
                </div>
              </BlurFade>
              <TextGenerateEffect
                words="Every capability, one tenant, one API."
                className="mx-auto max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl"
              />
              <BlurFade delay={0.15}>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                  Every capability is a REST endpoint, a webhook event, and a form in the same
                  tenant. You pay for what you turn on — not for another SKU.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild variant="polished" size="lg">
                    <Link href="/login#signup">Start free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/support/docs">Read the API docs</Link>
                  </Button>
                </div>
              </BlurFade>
            </div>
          </Spotlight>
        </section>

        <div className="mx-auto max-w-6xl px-6 pb-10 pt-14">
          {TIERS.map(({ tier, tagline, features }, tierIdx) => (
            <BlurFade key={tier} delay={0.04 + tierIdx * 0.05}>
              <div className="mt-14 first:mt-0">
                <div className="mb-6 flex flex-wrap items-baseline gap-3">
                  <Badge className={TIER_BADGE[tier]}>{tier}</Badge>
                  <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {tagline}
                  </h2>
                </div>
                <FocusFeatureGrid features={features} tier={tier} />
              </div>
            </BlurFade>
          ))}
        </div>

        <section className="mx-auto max-w-6xl px-6 py-10">
          <BlurFade>
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Design principles behind every feature
            </p>
          </BlurFade>
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background/40 py-2">
            <Marquee reverse pauseOnHover className="[--duration:32s]">
              {PRINCIPLE_CHIPS.map((chip) => (
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
