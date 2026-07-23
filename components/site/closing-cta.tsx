import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 40%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 70%)"
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, color-mix(in oklab, var(--primary) 30%, transparent), transparent)"
        }}
      />
      <Reveal>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="size-3.5 text-primary" />
            <span>2 seats free forever — no credit card</span>
          </div>
          <h2 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            Ship your business.<br />
            <span className="italic text-foreground/85">Not another spreadsheet.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Set up in twenty minutes. Migrate from whatever you're on. Cancel any time. Nothing to lose.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="polished" size="lg" className="h-12 px-6 text-base">
              <Link href="/login#signup">
                Start free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
              <Link href="/contact">Talk to a human</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
