import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrackedCtaLink } from "@/components/site/tracked-cta-link";

/**
 * Landing-page hero. Keep this server-rendered and lightweight: it is the
 * first viewport on the public site, so animation-heavy client islands here
 * directly hurt conversion and Core Web Vitals.
 */
export function Hero() {
  return (
    <section
      className="relative isolate overflow-hidden bg-background text-foreground"
      aria-labelledby="home-hero-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 75% 50% at 50% -10%, color-mix(in oklab, var(--primary) 16%, transparent), transparent 72%), linear-gradient(180deg, color-mix(in oklab, var(--muted) 46%, transparent), transparent 52%)"
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />

      <div
        className={cn(
          "mx-auto flex min-h-[88svh] max-w-5xl flex-col items-center justify-center",
          "px-6 pt-20 pb-16 text-center sm:pt-28"
        )}
      >
        <Badge
          variant="secondary"
          className="mb-6 gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur"
        >
          <Sparkles className="size-3.5" />
          Now available · India, EU, US
        </Badge>

        <h1
          id="home-hero-heading"
          className="font-display text-5xl leading-[1.05] text-foreground sm:text-7xl"
        >
          The clean way to run your{" "}
          <span className="relative inline-block">
            whole business
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-1 -z-10 h-3 rounded-full bg-primary/18 sm:h-4"
            />
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
          Sales, stock, accounting, HR and manufacturing in one product built
          for founder-led teams. Seat-based pricing. No forced modules.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-muted-foreground sm:text-base">
          <span className="rounded-full border border-border bg-background/80 px-3 py-1">Faster ops</span>
          <span className="rounded-full border border-border bg-background/80 px-3 py-1">Cleaner books</span>
          <span className="rounded-full border border-border bg-background/80 px-3 py-1">Happier team</span>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <TrackedCtaLink
            href="/login#signup"
            location="hero"
            label="start_free"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-7 text-base font-semibold text-primary-foreground shadow-elevation-md transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Start free
            <ArrowRight className="size-4" />
          </TrackedCtaLink>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-6 text-base"
          >
            <Link href="/product-tour">Watch the tour</Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Free forever plan · No credit card · 2 seats included
        </p>
      </div>
    </section>
  );
}
