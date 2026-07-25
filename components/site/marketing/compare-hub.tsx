"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, GitCompareArrows, Minus, Scale } from "lucide-react";
import type { HubCardItem } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { LogoMark } from "@/components/site/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BorderBeam } from "@/components/ui/border-beam";
import { Marquee } from "@/components/ui/marquee";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

type Tier = "Free" | "Pro" | "Business";
type Direction = "top" | "right" | "bottom" | "left";

const TIER_BADGE: Record<Tier, string> = {
  Free: "bg-muted text-foreground border-transparent",
  Pro: "bg-primary-gradient text-primary-foreground border-transparent",
  Business: "bg-foreground text-background border-transparent"
};

const COMPARE_META: Record<string, { category: string; tier: Tier }> = {
  odoo: { category: "ERP suite", tier: "Business" },
  zoho: { category: "App bundle", tier: "Pro" },
  netsuite: { category: "Enterprise ERP", tier: "Business" }
};

const DIRECTION_LENS: Record<
  Direction,
  { label: string; zivvy: string; other: string }
> = {
  top: {
    label: "Pricing",
    zivvy: "Seat-based · one line",
    other: "Modules + add-ons + quotes"
  },
  right: {
    label: "API surface",
    zivvy: "REST + webhooks per resource",
    other: "Varies per module"
  },
  bottom: {
    label: "Setup",
    zivvy: "Days · opinionated defaults",
    other: "Weeks · implementation partner"
  },
  left: {
    label: "Operator UX",
    zivvy: "Single tenant, roles by scope",
    other: "Instance-per-BU is common"
  }
};

const LENS_CHIPS = [
  "Pricing clarity",
  "Time to first value",
  "Operator UX",
  "Implementation weight",
  "REST + webhook surface",
  "Migration path"
];

/** Adapted from aceternity's DirectionAwareHover — hovers reveal a different lens per edge. */
function DirectionAwareCompareCard({
  item,
  index
}: {
  item: HubCardItem;
  index: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [direction, setDirection] = useState<Direction>("top");
  const [hovered, setHovered] = useState(false);
  const meta = COMPARE_META[item.slug] ?? {
    category: "Comparison",
    tier: "Pro" as Tier
  };
  const other = item.title.replace(/^Zivvy vs\s+/i, "").trim() || item.title;
  const lens = DIRECTION_LENS[direction];

  const detectDirection = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return "top" as Direction;
    const rect = ref.current.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const x = event.clientX - rect.left - (w / 2) * (w > h ? h / w : 1);
    const y = event.clientY - rect.top - (h / 2) * (h > w ? w / h : 1);
    const d = Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4;
    switch (d) {
      case 0:
        return "top";
      case 1:
        return "right";
      case 2:
        return "bottom";
      default:
        return "left";
    }
  };

  return (
    <Link
      ref={ref}
      href={`/compare/${item.slug}`}
      onMouseEnter={(e) => {
        setDirection(detectDirection(e));
        setHovered(true);
      }}
      onMouseMove={(e) => setDirection(detectDirection(e))}
      onMouseLeave={() => setHovered(false)}
      className="group relative block h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70"
    >
      <BorderBeam
        size={80}
        duration={8}
        delay={index * 1.2}
        colorFrom="#34d399"
        colorTo="#0f766e"
        borderWidth={1.5}
      />
      {/* Direction hint labels around the perimeter — subtle, only visible on hover */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300",
          hovered && "opacity-100"
        )}
      >
        {(Object.keys(DIRECTION_LENS) as Direction[]).map((d) => (
          <span
            key={d}
            className={cn(
              "absolute font-mono text-[9px] uppercase tracking-widest transition-colors",
              direction === d ? "text-primary" : "text-muted-foreground/60",
              d === "top" && "left-1/2 top-2 -translate-x-1/2",
              d === "bottom" && "left-1/2 bottom-2 -translate-x-1/2",
              d === "left" && "left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-center",
              d === "right" &&
                "right-2 top-1/2 -translate-y-1/2 rotate-90 origin-center"
            )}
          >
            {DIRECTION_LENS[d].label}
          </span>
        ))}
      </div>

      <div className="relative z-20 flex h-full flex-col p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-end gap-1.5">
          <Badge variant="outline" className="text-[10px] font-medium">
            {meta.category}
          </Badge>
          <Badge className={cn("text-[10px]", TIER_BADGE[meta.tier])}>{meta.tier}</Badge>
        </div>
        <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex items-center justify-center rounded-xl border border-primary/30 bg-primary/10 px-3 py-3 text-center">
            <LogoMark className="size-6" />
          </div>
          <div className="flex size-9 items-center justify-center rounded-full border border-border/70 bg-background text-xs font-semibold text-muted-foreground">
            vs
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/40 px-3 py-3 text-center">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {other}
            </p>
          </div>
        </div>
        <h2 className="font-display text-xl font-semibold group-hover:text-primary">
          {item.title}
        </h2>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{item.description}</p>

        {/* Direction-aware lens reveal */}
        <div className="relative mt-5 min-h-[92px] overflow-hidden rounded-xl border border-border/50 bg-background/40 p-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={hovered ? direction : "idle"}
              initial={{
                x: direction === "left" ? -12 : direction === "right" ? 12 : 0,
                y: direction === "top" ? -8 : direction === "bottom" ? 8 : 0,
                opacity: 0
              }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {hovered ? `Lens · ${lens.label}` : "Hover from any edge · four lenses"}
              </p>
              {hovered ? (
                <div className="grid gap-1.5 text-xs">
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3 shrink-0 text-primary" />
                    <span>
                      <span className="font-medium text-foreground">Zivvy · </span>
                      <span className="text-muted-foreground">{lens.zivvy}</span>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Minus className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                    <span>
                      <span className="font-medium text-foreground">{other} · </span>
                      <span className="text-muted-foreground">{lens.other}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Enter from top for pricing, right for API, bottom for setup, left for UX.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          Open full comparison
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

type Props = {
  items: HubCardItem[];
};

export function CompareHubPage({ items }: Props) {
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
                "linear-gradient(90deg, color-mix(in oklab, var(--primary) 14%, transparent) 0%, transparent 42%, transparent 58%, color-mix(in oklab, var(--muted-foreground) 8%, transparent) 100%)"
            }}
          />
          <div className="relative mx-auto max-w-5xl px-6 pb-6 pt-20 text-center sm:pt-24">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <Scale className="size-3.5 text-primary" />
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  Compare · side by side · no fluff
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Zivvy versus the incumbents
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Every capability is a REST resource with a matching webhook event. Compare that
                surface against the incumbent&apos;s module bundle — not marketing bullets.
              </p>
            </BlurFade>

            <BlurFade delay={0.1}>
              <div className="relative mx-auto mt-10 grid max-w-4xl grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                {/* LEFT — Zivvy */}
                <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-primary/5 px-6 py-8 text-left shadow-lg shadow-primary/10">
                  <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={12} />
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                      Zivvy
                    </span>
                    <Badge className="bg-primary-gradient text-primary-foreground text-[10px]">
                      Free · Pro · Business
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      aria-hidden
                      className="flex size-12 items-center justify-center rounded-2xl border border-primary/40 shadow-md shadow-primary/30"
                    >
                      <LogoMark className="size-12" />
                    </div>
                    <div>
                      <p className="font-display text-xl font-semibold">One tenant.</p>
                      <p className="text-sm text-muted-foreground">
                        One auth boundary. One webhook stream.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CENTER — vs */}
                <div className="flex items-center justify-center">
                  <div className="relative flex size-14 items-center justify-center rounded-full border border-border/70 bg-background shadow-md">
                    <span className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
                      vs.
                    </span>
                    <span className="pointer-events-none absolute inset-0 animate-pulse rounded-full border border-primary/30" />
                  </div>
                </div>

                {/* RIGHT — Any other tool */}
                <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-muted/30 px-6 py-8 text-left">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Any other tool
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      Suite / bundle
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      aria-hidden
                      className="flex size-12 items-center justify-center rounded-2xl border border-dashed border-border bg-background text-xl font-bold text-muted-foreground"
                    >
                      ?
                    </div>
                    <div>
                      <p className="font-display text-xl font-semibold text-muted-foreground">
                        Six tools.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Five contracts. One tenant per BU.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-4 pt-14">
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <GitCompareArrows className="size-4 text-primary" />
            <span>
              Hover a card from any edge — each direction reveals a different comparison lens.
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <BlurFade key={item.slug} delay={0.04 + index * 0.05}>
                <DirectionAwareCompareCard item={item} index={index} />
              </BlurFade>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10">
          <BlurFade>
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              What each comparison covers
            </p>
          </BlurFade>
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/40 py-2">
            <Marquee pauseOnHover reverse className="[--duration:26s]">
              {LENS_CHIPS.map((chip) => (
                <div
                  key={chip}
                  className={cn(
                    "mx-2 rounded-lg border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium shadow-sm"
                  )}
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
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={12} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Want a factual scorecard?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Send us the incumbent&apos;s current invoice and module list. We&apos;ll return a
              row-by-row scorecard, no sales spin.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/contact">Request a scorecard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/alternatives">See migration paths</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
