import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%)"
        }}
      />
      <div className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center sm:pt-32">
        <Badge
          variant="secondary"
          className="mb-6 gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium backdrop-blur"
        >
          <Sparkles className="size-3.5" />
          Now billing on Polar · India, EU, US
        </Badge>
        <h1 className="font-display text-5xl leading-[1.02] tracking-tight text-foreground sm:text-7xl">
          The clean way to run your <em className="italic text-foreground/85">whole business</em>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Sales, stock, accounting, HR and manufacturing in one product that finally feels made for you. Powered by an open ERP core, packaged by Vestcodes.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="polished" size="lg" className="h-12 px-6 text-base">
            <Link href="/login#signup">
              Start free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Free forever plan · No credit card · 2 seats included
        </p>
      </div>
    </section>
  );
}
