"use client";

import { useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { Check, FileUp, Rocket, UserPlus } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { BrandLogo } from "@/components/site/brand-logo";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

/**
 * HowItWorksScroll — page-scroll driven, four-step story.
 *
 * The previous implementation nested the animation inside a 480px scroll
 * jail (StickyScroll from aceternity), and its right column was decorative
 * gradient tiles that carried no product signal. This rewrite:
 *   • drives the story from real page scroll (no inner overflow container)
 *   • gives each step a distinct mini-mockup on the right
 *   • adds a progress bar on the left to show where you are in the section
 *   • falls back to a static grid when prefers-reduced-motion is on
 */

// ---------------------------------------------------------------------------
// Step visuals
// ---------------------------------------------------------------------------

function SignupMockup() {
  return (
    <motion.div
      key="step-1-signup"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="absolute inset-0 flex items-center justify-center p-6"
    >
      <div className="w-full max-w-[280px] rounded-xl border border-border/60 bg-background/95 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <UserPlus className="size-3.5 text-primary" aria-hidden />
          Create your workspace
        </div>
        <div className="mt-3 space-y-2">
          <div className="rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-[12px] text-muted-foreground">
            you@company.com
          </div>
          <div className="rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-[12px] text-muted-foreground">
            Region · EU
          </div>
          <div className="rounded-md bg-primary px-2.5 py-1.5 text-center text-[12px] font-medium text-primary-foreground">
            Continue
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400"
        >
          <span className="inline-flex size-4 items-center justify-center rounded-full bg-emerald-500/15">
            <Check className="size-3" aria-hidden />
          </span>
          Workspace ready
        </motion.div>
      </div>
    </motion.div>
  );
}

function ImportMockup() {
  return (
    <motion.div
      key="step-2-import"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="absolute inset-0 flex items-center justify-center p-6"
    >
      <div className="w-full max-w-[280px] rounded-xl border border-border/60 bg-background/95 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileUp className="size-3.5 text-primary" aria-hidden />
          Importing customers.csv
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
          <div className="rounded-md border border-border/60 bg-background/70 px-2 py-1.5">
            <div className="font-semibold text-foreground">
              <NumberTicker
                value={247}
                className="text-foreground dark:text-foreground"
              />
            </div>
            <div className="text-muted-foreground">Customers</div>
          </div>
          <div className="rounded-md border border-border/60 bg-background/70 px-2 py-1.5">
            <div className="font-semibold text-foreground">
              <NumberTicker
                value={512}
                delay={0.1}
                className="text-foreground dark:text-foreground"
              />
            </div>
            <div className="text-muted-foreground">Items</div>
          </div>
          <div className="rounded-md border border-border/60 bg-background/70 px-2 py-1.5">
            <div className="font-semibold text-foreground">
              <NumberTicker
                value={1203}
                delay={0.2}
                className="text-foreground dark:text-foreground"
              />
            </div>
            <div className="text-muted-foreground">Txns</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const INTEGRATION_SLUGS = [
  "slack",
  "stripe",
  "shopify",
  "hubspot",
  "quickbooks",
  "notion",
];

function IntegrationsMockup() {
  return (
    <motion.div
      key="step-3-integrations"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="absolute inset-0 flex items-center justify-center p-6"
    >
      <div className="w-full max-w-[280px] rounded-xl border border-border/60 bg-background/95 p-4 shadow-sm">
        <div className="text-xs text-muted-foreground">
          Connect the tools you already use
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {INTEGRATION_SLUGS.map((slug, i) => (
            <motion.div
              key={slug}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.15 + i * 0.08,
                duration: 0.25,
                ease: "easeOut",
              }}
              className="flex aspect-square items-center justify-center rounded-md border border-border/60 bg-background/70 text-muted-foreground"
            >
              <BrandLogo slug={slug} monotone={false} className="size-6" />
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400"
        >
          <span className="inline-flex size-4 items-center justify-center rounded-full bg-emerald-500/15">
            <Check className="size-3" aria-hidden />
          </span>
          Signed webhooks live
        </motion.div>
      </div>
    </motion.div>
  );
}

function ShipItMockup() {
  return (
    <motion.div
      key="step-4-ship"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="absolute inset-0 flex items-center justify-center p-6"
    >
      <div className="w-full max-w-[280px] rounded-xl border border-border/60 bg-background/95 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Rocket className="size-3.5 text-primary" aria-hidden />
          Live · day one
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md border border-border/60 bg-background/70 px-2 py-2">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              MRR
            </div>
            <div className="mt-0.5 text-sm font-semibold text-foreground">
              $
              <NumberTicker
                value={12340}
                className="text-foreground dark:text-foreground"
              />
            </div>
          </div>
          <div className="rounded-md border border-border/60 bg-background/70 px-2 py-2">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Orders
            </div>
            <div className="mt-0.5 text-sm font-semibold text-foreground">
              <NumberTicker
                value={128}
                delay={0.15}
                className="text-foreground dark:text-foreground"
              />
            </div>
          </div>
          <div className="rounded-md border border-border/60 bg-background/70 px-2 py-2">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Team
            </div>
            <div className="mt-0.5 text-sm font-semibold text-foreground">
              <NumberTicker
                value={4}
                delay={0.3}
                className="text-foreground dark:text-foreground"
              />
            </div>
          </div>
        </div>
        <div className="mt-3 flex h-10 items-end gap-1">
          {[35, 52, 44, 68, 61, 82, 74].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{
                delay: 0.15 + i * 0.05,
                duration: 0.35,
                ease: "easeOut",
              }}
              className="flex-1 rounded-sm bg-primary/70"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Step data
// ---------------------------------------------------------------------------

type Step = {
  title: string;
  description: string;
  render: () => React.ReactElement;
};

const STEPS: Step[] = [
  {
    title: "Sign up in two minutes",
    description:
      "Pick India, EU, or US at signup. Your workspace boots with sensible defaults — chart of accounts, tax templates, and the modules you flipped on.",
    render: () => <SignupMockup />,
  },
  {
    title: "Import your data",
    description:
      "CSV import for customers, suppliers, items, opening stock and opening balances. Larger migrations from Odoo, SAP B1 or Zoho get mapping help.",
    render: () => <ImportMockup />,
  },
  {
    title: "Configure integrations",
    description:
      "Slack, Stripe, HubSpot, Shopify — connect the systems your team already uses. Signed webhooks push events where you need them.",
    render: () => <IntegrationsMockup />,
  },
  {
    title: "Ship it",
    description:
      "Run your first real workflow the same day — quote to invoice, or receive to ship. Upgrade only when a module earns its seat.",
    render: () => <ShipItMockup />,
  },
];

// ---------------------------------------------------------------------------
// Static (reduced-motion) fallback
// ---------------------------------------------------------------------------

function StaticFallback() {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2">
      {STEPS.map((step, i) => (
        <div
          key={step.title}
          className="rounded-2xl border border-border/60 bg-card/50 p-6"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            Step {String(i + 1).padStart(2, "0")}
          </div>
          <h3 className="mt-1 text-lg font-semibold text-foreground">
            {step.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function HowItWorksScroll() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Drive step from the section's own scroll progress. offset ends "end end"
  // so the last step stays pinned until the section is fully scrolled past.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Smooth progress for the left rail. Springy so the bar reads as motion
  // instead of a jumpy number-line.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.3,
  });
  const progressHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // Map progress → step index. Bias the boundaries so each step gets an
  // equal slice of the scroll (0..0.25, 0.25..0.5, …).
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const clamped = Math.min(Math.max(latest, 0), 0.999);
    const idx = Math.floor(clamped * STEPS.length);
    setActive(idx);
  });

  const stepsWithIndex = useMemo(
    () =>
      STEPS.map((s, i) => ({
        ...s,
        index: i,
      })),
    [],
  );

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <BlurFade>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            How teams start on Zivvy
          </h2>
          <p className="mt-3 text-muted-foreground">
            Four steps. No implementation theatre. Scroll to walk through the
            onboarding your team will actually do.
          </p>
        </div>
      </BlurFade>

      {reduce ? (
        <StaticFallback />
      ) : (
        <div
          ref={sectionRef}
          className="relative mt-12"
          // Give the section enough scroll runway that each step gets ~90vh
          // of pin time. Roughly 4×90vh + a bit of tail.
          style={{ height: "clamp(2200px, 400vh, 3600px)" }}
        >
          <div className="sticky top-24 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            {/* Left column: rail + step list */}
            <div className="relative flex gap-6">
              {/* Progress rail */}
              <div className="relative hidden w-1 shrink-0 rounded-full bg-border/60 sm:block">
                <motion.div
                  aria-hidden
                  style={{ height: progressHeight }}
                  className="absolute inset-x-0 top-0 rounded-full bg-primary"
                />
              </div>

              {/* Step list */}
              <ol className="flex-1 space-y-8">
                {stepsWithIndex.map((step) => {
                  const isActive = active === step.index;
                  return (
                    <motion.li
                      key={step.title}
                      animate={{
                        opacity: isActive ? 1 : 0.35,
                        x: isActive ? 0 : -4,
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="relative"
                    >
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                        <span
                          className={cn(
                            "inline-flex size-5 items-center justify-center rounded-full border text-[10px] transition-colors",
                            isActive
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-muted-foreground",
                          )}
                        >
                          {String(step.index + 1).padStart(2, "0")}
                        </span>
                        Step {step.index + 1}
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
                        {step.description}
                      </p>
                    </motion.li>
                  );
                })}
              </ol>
            </div>

            {/* Right column: sticky mockup panel */}
            <div className="hidden lg:block">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/8 via-background to-background shadow-sm">
                <AnimatePresence mode="wait">
                  {STEPS[active].render()}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
