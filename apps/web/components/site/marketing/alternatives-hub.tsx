"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Map, Route } from "lucide-react";
import type { HubCardItem } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedList } from "@/components/ui/animated-list";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

const Compare = dynamic(
  () => import("@/components/ui/aceternity/compare").then((m) => m.Compare),
  { ssr: false }
);

const HoverBorderGradient = dynamic(
  () =>
    import("@/components/ui/aceternity/hover-border-gradient").then(
      (m) => m.HoverBorderGradient
    ),
  { ssr: false }
);

type Tier = "Free" | "Pro" | "Business";

const TIER_BADGE: Record<Tier, string> = {
  Free: "bg-muted text-foreground border-transparent",
  Pro: "bg-primary-gradient text-primary-foreground border-transparent",
  Business: "bg-foreground text-background border-transparent"
};

type AlternativeMeta = {
  category: string;
  tier: Tier;
  whySwitch: string;
  savings: string;
  bullets: string[];
};

const ALTERNATIVE_META: Record<string, AlternativeMeta> = {
  odoo: {
    category: "ERP suite",
    tier: "Business",
    whySwitch: "Cut the module-per-app SKU bloat",
    savings: "One line item · $1,620/mo saved",
    bullets: [
      "Map Odoo modules → Zivvy resources",
      "Import customers, invoices, open orders",
      "Cut over reporting last, retire on flip"
    ]
  },
  zoho: {
    category: "App bundle",
    tier: "Pro",
    whySwitch: "One tenant instead of an app-per-workflow",
    savings: "Fewer auth models · faster onboarding",
    bullets: [
      "Consolidate CRM + Books + Inventory",
      "Same webhook stream for every module",
      "Roles by scope, not by app"
    ]
  },
  "legacy-erp": {
    category: "Legacy ERP",
    tier: "Business",
    whySwitch: "Retire the SFTP + SOAP + VPN stack",
    savings: "REST-first · webhook-first surface",
    bullets: [
      "Every resource is a REST endpoint",
      "Signed webhooks with replay + retries",
      "Multi-region deploys with failover"
    ]
  }
};

const DEFAULT_META: AlternativeMeta = {
  category: "Alternative",
  tier: "Pro",
  whySwitch: "Faster to run, cheaper to change",
  savings: "One tenant · one webhook stream",
  bullets: [
    "REST + webhook per resource",
    "Seat-based, one line item",
    "Written cut-over plan"
  ]
};

const MIGRATION_STREAM = [
  "Map current tools → Zivvy modules",
  "Pilot one business unit",
  "Import customers & open orders",
  "Train owners on day-1 workflows",
  "Cut over reporting, then retire legacy"
];

type Props = {
  items: HubCardItem[];
};

export function AlternativesHubPage({ items }: Props) {
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
                "radial-gradient(ellipse 70% 55% at 50% -10%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 75%)"
            }}
          />
          <div className="relative mx-auto grid max-w-6xl gap-8 px-6 pb-6 pt-20 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <BlurFade>
                <div className="mb-5 inline-flex items-center justify-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                  <Route className="size-3.5 text-primary" />
                  <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                    Alternatives · migration paths · low drama
                  </AnimatedShinyText>
                </div>
                <TextAnimate
                  as="h1"
                  by="word"
                  animation="blurInUp"
                  className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
                >
                  Slide it — see the before, see the after.
                </TextAnimate>
                <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                  Same tenant boundary, same REST + webhook surface — different lift-and-shift path per
                  incumbent. Not feature-bingo scorecards.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button asChild variant="polished">
                    <Link href="/contact">Plan a migration</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/compare">See side-by-sides</Link>
                  </Button>
                </div>
              </BlurFade>
            </div>
            <BlurFade delay={0.1}>
              <div className="relative mx-auto w-full max-w-md">
                <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-primary/10 blur-2xl" />
                <div className="relative rounded-3xl border border-border/70 bg-card/40 p-3 shadow-xl shadow-primary/10">
                  <Compare
                    firstImage="/marketing/before-legacy.svg"
                    secondImage="/marketing/after-zivvy.svg"
                    className="h-[280px] w-full sm:h-[320px]"
                    firstImageClassName="object-cover"
                    secondImageClassname="object-cover"
                    slideMode="hover"
                    autoplay
                    autoplayDuration={5200}
                  />
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Hover or drag to compare the incumbent stack against a single tenant.
                </p>
              </div>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-8 pt-14 lg:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item, index) => {
              const meta = ALTERNATIVE_META[item.slug] ?? DEFAULT_META;
              return (
                <BlurFade key={item.slug} delay={0.04 + index * 0.04}>
                  <HoverBorderGradient
                    as="div"
                    containerClassName={cn(
                      "rounded-2xl w-full h-full block",
                      // aceternity ships two hardcoded bg-black fills — swap for our card token
                      "[&>.bg-black]:!bg-card [&>.bg-black]:!text-foreground"
                    )}
                    className="w-full h-full !p-0 rounded-2xl"
                    duration={2.4}
                  >
                    <Link
                      href={`/alternatives/${item.slug}`}
                      className="group block h-full rounded-2xl p-5"
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="border-primary/40 bg-primary/10 text-[10px] font-medium text-primary"
                        >
                          Why switch · {meta.whySwitch}
                        </Badge>
                      </div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Migration path
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {meta.category}
                          </Badge>
                          <Badge className={cn("text-[10px]", TIER_BADGE[meta.tier])}>
                            {meta.tier}
                          </Badge>
                        </div>
                      </div>
                      <h2 className="mt-1 font-display text-lg font-semibold group-hover:text-primary">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                      <ul className="mt-3 space-y-1.5 text-sm">
                        {meta.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-foreground/90">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 rounded-md border border-border/50 bg-background/40 px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground">
                        {meta.savings}
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        Open migration guide
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </HoverBorderGradient>
                </BlurFade>
              );
            })}
          </div>

          <BlurFade delay={0.1}>
            <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5">
              <ShineBorder shineColor={["#0f766e", "#34d399"]} duration={16} />
              <div className="mb-2 flex items-center gap-2">
                <Map className="size-4 text-primary" />
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Typical rollout sequence
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Pilot first. Expand when owners trust the daily path.
              </p>
              <div className="mt-5 min-h-[15rem]">
                <AnimatedList delay={1300} className="gap-2">
                  {MIGRATION_STREAM.map((step) => (
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

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-4 sm:pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8 text-center">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Bring your migration plan
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Share the tenants, seats, and modules you run today. We&apos;ll return a written
              cut-over sequence with data-import checkpoints.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/contact">Plan your migration</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/compare">See side-by-sides</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
