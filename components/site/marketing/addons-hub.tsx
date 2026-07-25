import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AddonDetail } from "@/lib/addons-content";

/**
 * Hub grid for /addons. Cards link to /addons/[slug]. Rendered from a
 * pure server component — no client interaction on the hub page
 * itself.
 */

interface AddonsHubProps {
  addons: AddonDetail[];
}

export function AddonsHub({ addons }: AddonsHubProps) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-4xl px-6 pb-6 pt-20 text-center sm:pt-24">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-primary" />
            Add-ons · billed monthly
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Extend Zivvy without leaving Zivvy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Optional modules for teams that need commerce sync, German tax
            filing, in-ERP signing, or batch payouts. Turn them on per
            workspace — off just as easily.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="polished" size="lg">
              <a
                href="https://zivvy.xyz/settings/addons"
                target="_blank"
                rel="noreferrer"
              >
                Manage add-ons in your dashboard
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">See core pricing</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {addons.map((addon) => (
              <Link
                key={addon.slug}
                href={`/addons/${addon.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 transition-colors hover:border-primary/40 hover:bg-accent/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <Badge
                    variant="outline"
                    className="border-border/60 bg-background/70 font-medium text-muted-foreground"
                  >
                    {addon.category}
                  </Badge>
                  <span className="font-mono text-sm font-medium text-foreground">
                    {addon.price}
                  </span>
                </div>
                <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight group-hover:text-primary">
                  {addon.name}
                </h2>
                <p className="mt-2 text-sm font-medium text-foreground/80">
                  {addon.hero}
                </p>
                {addon.subtitle ? (
                  <p className="mt-1 text-xs italic text-muted-foreground">
                    {addon.subtitle}
                  </p>
                ) : null}
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {addon.description}
                </p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {addon.benefits.slice(0, 3).map((benefit) => (
                    <li
                      key={benefit.title}
                      className="rounded-full border border-border/50 bg-background/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {benefit.title}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Read the details
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
