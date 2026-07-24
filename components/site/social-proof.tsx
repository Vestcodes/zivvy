"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";
import { MagicCard } from "@/components/ui/magic-card";
import { cn } from "@/lib/utils";

/** Honest product facts — no vanity counts, stars, or invented testimonials. */
const PROOF_CHIPS = [
  "Sales · stock · accounting · HR · manufacturing",
  "Data stays in India, EU, or US",
  "Self-host on Business",
  "Seat-based pricing",
  "Free plan · 2 seats"
];

const AUDIENCES = [
  {
    title: "Founder-led teams",
    body: "One system before you outgrow three spreadsheets and a chat thread."
  },
  {
    title: "Ops & finance",
    body: "Orders, stock, and books that stay reconciled without nightly exports."
  },
  {
    title: "Manufacturing shops",
    body: "BOMs and work orders on Business when the floor needs a real plan."
  }
];

export function SocialProof() {
  return (
    <section className="py-16 sm:py-20">
      <BlurFade>
        <div className="relative mx-auto max-w-6xl overflow-hidden px-6">
          <p className="sr-only">{PROOF_CHIPS.join(". ")}.</p>
          <Marquee pauseOnHover aria-hidden className="[--duration:32s]">
            {PROOF_CHIPS.map((label) => (
              <span
                key={label}
                className={cn(
                  "mx-2 rounded-full border border-border/70 bg-card/80 px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm"
                )}
              >
                {label}
              </span>
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
        </div>
      </BlurFade>

      <div className="mx-auto mt-14 max-w-6xl px-6">
        <BlurFade>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for operators, not slide decks
            </h2>
            <p className="mt-3 text-muted-foreground">
              Who Zivvy fits when you want one clean system for the whole business —
              not invented quotes or star ratings.
            </p>
          </div>
        </BlurFade>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {AUDIENCES.map((item, i) => (
            <BlurFade key={item.title} delay={0.06 + i * 0.06}>
              <MagicCard
                className="h-full rounded-xl border border-border/70 bg-card/70 p-6"
                gradientFrom="#5eead4"
                gradientTo="#115e59"
                gradientColor="rgba(27, 152, 114, 0.1)"
              >
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </MagicCard>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
