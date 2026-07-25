"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { HubCardItem } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { BrandLogo } from "@/components/site/brand-logo";
import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import {
  AnimatedBeam,
  GlowingEffect,
  MovingBorderButton
} from "@/components/ui/aceternity";
import { cn } from "@/lib/utils";

// WorldMap uses SVG measurement and useId — client-only for cleanliness.
const WorldMap = dynamic(
  () =>
    import("@/components/ui/aceternity/world-map").then((mod) => mod.WorldMap),
  { ssr: false }
);

const PATTERN_CHIPS = [
  "Webhooks out",
  "Secure API in",
  "Event-driven sync",
  "No black-box glue",
  "Owner on the record",
  "Audit-friendly"
];

// Marquee'd brand logo strip — ~14 tools the app talks to. Order matters:
// we alternate categories so the marquee doesn't cluster all payments
// brands together.
const LOGO_STRIP = [
  "slack",
  "stripe",
  "shopify",
  "hubspot",
  "notion",
  "quickbooks",
  "salesforce",
  "zapier",
  "googledrive",
  "plaid",
  "twilio",
  "github",
  "posthog",
  "xero"
];

const CATEGORIES = [
  "All",
  "Payments",
  "Ecommerce",
  "Communication",
  "Analytics",
  "Compliance",
  "Developer"
] as const;

type Category = (typeof CATEGORIES)[number];

const DOCS_URL = "https://integrate.zivvy.xyz/docs";

type Props = {
  items: HubCardItem[];
};

function NetworkDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const slackRef = useRef<HTMLDivElement>(null);
  const hubspotRef = useRef<HTMLDivElement>(null);
  const driveRef = useRef<HTMLDivElement>(null);
  const zapierRef = useRef<HTMLDivElement>(null);
  const sfdcRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<HTMLDivElement>(null);

  const left: Array<{
    label: string;
    slug: string;
    ref: React.RefObject<HTMLDivElement | null>;
    curvature: number;
  }> = [
    { label: "Slack", slug: "slack", ref: slackRef, curvature: -55 },
    { label: "HubSpot", slug: "hubspot", ref: hubspotRef, curvature: 0 },
    { label: "Google Drive", slug: "googledrive", ref: driveRef, curvature: 55 }
  ];
  const right: Array<{
    label: string;
    slug: string;
    ref: React.RefObject<HTMLDivElement | null>;
    curvature: number;
  }> = [
    { label: "Zapier", slug: "zapier", ref: zapierRef, curvature: -55 },
    { label: "Salesforce", slug: "salesforce", ref: sfdcRef, curvature: 0 },
    { label: "Stripe", slug: "stripe", ref: stripeRef, curvature: 55 }
  ];

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex h-[360px] w-full max-w-md items-center justify-between px-4"
    >
      <div className="flex flex-col items-center gap-6">
        {left.map((sat) => (
          <div
            key={sat.label}
            ref={sat.ref}
            className="relative z-10 flex size-12 items-center justify-center rounded-xl border border-border/70 bg-card/80 shadow-sm backdrop-blur transition-transform hover:scale-105"
            title={sat.label}
            aria-label={sat.label}
          >
            <BrandLogo slug={sat.slug} className="size-6 text-foreground/80" />
          </div>
        ))}
      </div>

      <div
        ref={centerRef}
        className="relative z-20 flex size-20 items-center justify-center rounded-2xl border border-primary/50 bg-primary/15 font-display text-sm font-semibold text-primary shadow-lg backdrop-blur"
      >
        <span className="absolute inset-0 -z-10 animate-pulse rounded-2xl bg-primary/10" />
        Zivvy
      </div>

      <div className="flex flex-col items-center gap-6">
        {right.map((sat) => (
          <div
            key={sat.label}
            ref={sat.ref}
            className="relative z-10 flex size-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/5 shadow-sm backdrop-blur transition-transform hover:scale-105"
            title={sat.label}
            aria-label={sat.label}
          >
            <BrandLogo slug={sat.slug} className="size-6 text-primary" />
          </div>
        ))}
      </div>

      {[...left, ...right].map((sat, idx) => {
        const isLeft = left.includes(sat);
        return (
          <AnimatedBeam
            key={`beam-${sat.label}`}
            containerRef={containerRef}
            fromRef={sat.ref}
            toRef={centerRef}
            curvature={sat.curvature}
            reverse={!isLeft}
            duration={5 + idx * 0.4}
            delay={idx * 0.3}
            gradientStartColor="#34d399"
            gradientStopColor="#0f766e"
            pathColor="rgba(148,163,184,0.35)"
            pathOpacity={0.35}
          />
        );
      })}
    </div>
  );
}

// Category pills with a sliding highlight (AceternityTabs-style, but with a
// change callback so filtering works).
function CategoryPills({
  categories,
  active,
  onChange
}: {
  categories: Category[];
  active: Category;
  onChange: (cat: Category) => void;
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-border/70 bg-card/60 p-1 shadow-sm backdrop-blur">
      {categories.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            aria-pressed={isActive}
            className={cn(
              "relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="integration-category-pill"
                transition={{ type: "spring", bounce: 0.22, duration: 0.5 }}
                className="absolute inset-0 rounded-full border border-primary/40 bg-primary/10"
                aria-hidden
              />
            ) : null}
            <span className="relative z-10">{cat}</span>
          </button>
        );
      })}
    </div>
  );
}

// Rough coverage arcs for the world map — connects a few regions to a
// central hub to visualise "integrations everywhere".
const MAP_CONNECTIONS = [
  {
    start: { lat: 40.7128, lng: -74.006, label: "New York" },
    end: { lat: 51.5074, lng: -0.1278, label: "London" }
  },
  {
    start: { lat: 51.5074, lng: -0.1278, label: "London" },
    end: { lat: 1.3521, lng: 103.8198, label: "Singapore" }
  },
  {
    start: { lat: 40.7128, lng: -74.006, label: "New York" },
    end: { lat: -33.8688, lng: 151.2093, label: "Sydney" }
  },
  {
    start: { lat: -23.5505, lng: -46.6333, label: "São Paulo" },
    end: { lat: 51.5074, lng: -0.1278, label: "London" }
  },
  {
    start: { lat: 35.6762, lng: 139.6503, label: "Tokyo" },
    end: { lat: 37.7749, lng: -122.4194, label: "San Francisco" }
  }
];

export function IntegrationsHubPage({ items }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const availableCategories = useMemo<Category[]>(() => {
    const present = new Set<string>();
    for (const item of items) {
      if (item.category) present.add(item.category);
    }
    return CATEGORIES.filter((cat) => cat === "All" || present.has(cat));
  }, [items]);

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? items
        : items.filter((item) => item.category === activeCategory),
    [items, activeCategory]
  );

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-10 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center sm:pt-24">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  Integrations · API · webhooks
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Connect tools without losing the workflow
              </TextAnimate>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                Zivvy stays the system of record. Integrations notify, sync, and automate around
                the same owners, approvals, and audit trail.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="polished">
                  <a href={DOCS_URL} target="_blank" rel="noreferrer">
                    Read API docs
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={DOCS_URL} target="_blank" rel="noreferrer">
                    Explore API
                  </a>
                </Button>
              </div>
            </BlurFade>

            <BlurFade delay={0.1}>
              <NetworkDiagram />
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-6 pt-2">
          <BlurFade>
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Global coverage
              </h2>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Deploys close to your team
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/40 p-2 sm:p-4">
              <WorldMap dots={MAP_CONNECTIONS} lineColor="#34d399" />
            </div>
          </BlurFade>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-2">
          <BlurFade>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="relative rounded-2xl border border-border/70 bg-card/50 p-5">
                <GlowingEffect
                  glow
                  disabled={false}
                  proximity={64}
                  spread={30}
                  blur={0}
                  movementDuration={1.5}
                  borderWidth={1}
                />
                <div className="relative rounded-xl border border-border/50 bg-background/60 px-4 py-5 text-center">
                  <p className="font-display text-3xl font-semibold tracking-tight">
                    <NumberTicker value={130} />
                    <span className="text-primary">+</span>
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    REST endpoints
                  </p>
                </div>
              </div>
              <div className="relative rounded-2xl border border-border/70 bg-card/50 p-5">
                <GlowingEffect
                  glow
                  disabled={false}
                  proximity={64}
                  spread={30}
                  blur={0}
                  movementDuration={1.5}
                  borderWidth={1}
                />
                <div className="relative rounded-xl border border-border/50 bg-background/60 px-4 py-5 text-center">
                  <p className="font-display text-3xl font-semibold tracking-tight">
                    HMAC-signed
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Webhooks
                  </p>
                </div>
              </div>
              <div className="relative rounded-2xl border border-border/70 bg-card/50 p-5">
                <GlowingEffect
                  glow
                  disabled={false}
                  proximity={64}
                  spread={30}
                  blur={0}
                  movementDuration={1.5}
                  borderWidth={1}
                />
                <div className="relative rounded-xl border border-border/50 bg-background/60 px-4 py-5 text-center">
                  <p className="font-display text-3xl font-semibold tracking-tight">
                    <NumberTicker value={100} />
                    <span className="text-primary">+</span>
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Event types
                  </p>
                </div>
              </div>
            </div>
          </BlurFade>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-2 pt-10">
          <BlurFade>
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Works with the tools you already use
            </p>
          </BlurFade>
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/40 py-3">
            <Marquee pauseOnHover className="[--duration:32s]">
              {LOGO_STRIP.map((slug) => (
                <div
                  key={slug}
                  className="mx-3 flex items-center justify-center"
                  title={slug}
                >
                  <BrandLogo
                    slug={slug}
                    className="size-8 text-muted-foreground/80 transition-colors hover:text-foreground"
                  />
                </div>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-3 pt-8">
          <BlurFade>
            <CategoryPills
              categories={availableCategories}
              active={activeCategory}
              onChange={setActiveCategory}
            />
          </BlurFade>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 px-6 py-12 text-center text-sm text-muted-foreground">
              No integrations in this category yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item, index) => (
                <BlurFade key={item.slug} delay={0.04 + index * 0.04}>
                  <Link href={`/integrations/${item.slug}`} className="group block h-full">
                    <MagicCard
                      className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5"
                      gradientFrom="#34d399"
                      gradientTo="#0f766e"
                      gradientColor="rgba(27, 152, 114, 0.1)"
                    >
                      {index % 3 === 0 ? (
                        <BorderBeam size={55} duration={8} colorFrom="#34d399" colorTo="#0f766e" />
                      ) : null}
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background/70">
                          <BrandLogo
                            slug={item.slug}
                            label={item.title}
                            className="size-5 text-primary"
                          />
                        </div>
                        {item.category ? (
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {item.category}
                          </Badge>
                        ) : null}
                      </div>
                      <h2 className="font-display text-lg font-semibold group-hover:text-primary">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        View integration
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </MagicCard>
                  </Link>
                </BlurFade>
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10">
          <BlurFade>
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Design principles
            </p>
          </BlurFade>
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/40 py-2">
            <Marquee pauseOnHover reverse className="[--duration:26s]">
              {PATTERN_CHIPS.map((chip) => (
                <div
                  key={chip}
                  className="mx-2 rounded-lg border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium shadow-sm"
                >
                  {chip}
                </div>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-background to-transparent" />
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-2 sm:pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8 text-center">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Building a custom connector?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Start from the API docs pattern, or talk through event contracts before you wire glue.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MovingBorderButton
                as={Link}
                href="/contact"
                borderRadius="0.65rem"
                duration={3800}
                containerClassName="h-11 w-full sm:w-auto text-sm"
                borderClassName="bg-[radial-gradient(circle,rgba(52,211,153,0.9)_40%,transparent_60%)]"
                className="!bg-primary !text-primary-foreground !border-primary/60 px-6 font-medium"
              >
                <span className="inline-flex items-center gap-2">
                  Plan integration
                  <ArrowRight className="size-4" />
                </span>
              </MovingBorderButton>
              <Button asChild variant="outline">
                <a href={DOCS_URL} target="_blank" rel="noreferrer">
                  Read docs
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
