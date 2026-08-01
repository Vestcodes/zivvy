"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedList } from "@/components/ui/animated-list";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";

const STEPS = [
  {
    title: "Create a workspace",
    body: "Pick India, EU, or US. Invite up to two seats on Free — no card."
  },
  {
    title: "Run one real workflow",
    body: "Quote → order → invoice, or stock receive → pick → ship. Stay on records, not chat."
  },
  {
    title: "Turn on what pays for itself",
    body: "Upgrade to Pro or Business when accounting, payroll, or manufacturing actually matter."
  }
];

const LIVE = [
  "Quote approved → sales order",
  "Stock reserved → pick list",
  "Invoice posted → payment due",
  "Exception raised → owner assigned"
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <BlurFade>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              How teams start on Zivvy
            </h2>
            <p className="mt-3 text-muted-foreground">
              Three steps. No implementation theater. Upgrade only when a module earns its seat.
              Most teams run their first real workflow the same day.
            </p>
          </div>
        </BlurFade>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <ol className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {STEPS.map((step, index) => (
              <BlurFade key={step.title} delay={0.05 + index * 0.05}>
                <li className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5">
                  {index === 0 ? (
                    <BorderBeam size={50} duration={7} colorFrom="#34d399" colorTo="#0f766e" />
                  ) : null}
                  <p className="font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                </li>
              </BlurFade>
            ))}
          </ol>

          <BlurFade delay={0.12}>
            <MagicCard
              className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5"
              gradientFrom="#34d399"
              gradientTo="#0f766e"
              gradientColor="rgba(27, 152, 114, 0.1)"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Day-one stream
              </p>
              <div className="mt-4 min-h-[12rem]">
                <AnimatedList delay={1300} className="gap-2">
                  {LIVE.map((item) => (
                    <div
                      key={item}
                      className="w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-left text-sm shadow-sm"
                    >
                      {item}
                    </div>
                  ))}
                </AnimatedList>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/50 bg-background/50 px-3 py-3 text-center">
                  <p className="font-display text-2xl font-semibold">
                    <NumberTicker value={2} />
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">free seats</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/50 px-3 py-3 text-center">
                  <p className="font-display text-2xl font-semibold">
                    <NumberTicker value={0} />
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">card to start</p>
                </div>
              </div>
              <Button asChild variant="outline" className="mt-5 w-full">
                <Link href="/product-tour">
                  Watch product tour
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </MagicCard>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
