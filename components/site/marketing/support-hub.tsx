"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  LifeBuoy,
  Map,
  Rocket,
  ScrollText,
  Search
} from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedList } from "@/components/ui/animated-list";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

type Tier = "Free" | "Pro" | "Business";

const TIER_BADGE: Record<Tier, string> = {
  Free: "bg-muted text-foreground border-transparent",
  Pro: "bg-primary-gradient text-primary-foreground border-transparent",
  Business: "bg-foreground text-background border-transparent"
};

const SUPPORT_LINKS: {
  title: string;
  href: string;
  description: string;
  Icon: React.ElementType;
  category: string;
  tier: Tier;
}[] = [
  {
    title: "Documentation",
    href: "/support/docs",
    description:
      "Getting started, /api reference, webhook events, tenant configuration, and troubleshooting.",
    Icon: BookOpen,
    category: "Docs",
    tier: "Free"
  },
  {
    title: "Help center",
    href: "/support/help-center",
    description:
      "Answers for billing, seat management, tenant migration, security, and technical incidents.",
    Icon: LifeBuoy,
    category: "Support",
    tier: "Pro"
  },
  {
    title: "Changelog",
    href: "/support/changelog",
    description: "Endpoint changes, webhook payload updates, and feature launches per release.",
    Icon: ScrollText,
    category: "Releases",
    tier: "Free"
  },
  {
    title: "Roadmap",
    href: "/support/roadmap",
    description: "What we are building now, next, and later — with API and webhook impact called out.",
    Icon: Map,
    category: "Roadmap",
    tier: "Free"
  }
];

const QUICK_QUERIES = [
  "How do I rotate a webhook secret?",
  "Set up multi-tenant SSO",
  "Reconcile a Stripe payout",
  "Export /invoices to my ledger",
  "Turn on manufacturing on my tenant"
];

const STREAM = [
  "Invite teammates → assign roles",
  "Import customers → first quote",
  "Connect payments → reconcile",
  "Subscribe to webhooks → automate"
];

export function SupportHubPage() {
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
                "radial-gradient(ellipse 70% 60% at 50% -10%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 75%)"
            }}
          />
          <div className="relative mx-auto max-w-4xl px-6 pb-8 pt-20 text-center sm:pt-24">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <Rocket className="size-3.5 text-primary" />
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  Support · docs · changelog · roadmap
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                What do you need to finish?
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Search docs, changelog, and roadmap in the same tenant model you&apos;ll use in-product.
                No login required.
              </p>
            </BlurFade>

            <BlurFade delay={0.08}>
              <form
                action="/support/docs"
                method="get"
                className="relative mx-auto mt-8 max-w-xl"
              >
                <label htmlFor="support-search" className="sr-only">
                  Search support
                </label>
                <div className="relative flex items-center overflow-hidden rounded-full border border-border/70 bg-background/80 shadow-lg shadow-primary/5 backdrop-blur">
                  <Search className="pointer-events-none absolute left-4 size-4 text-muted-foreground" />
                  <input
                    id="support-search"
                    name="q"
                    type="search"
                    placeholder="Search docs, endpoints, webhook events…"
                    className="w-full bg-transparent px-11 py-3 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    className={cn(
                      "m-1 rounded-full bg-primary-gradient px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                    )}
                  >
                    Search
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Try:</span>
                  {QUICK_QUERIES.map((q) => (
                    <Link
                      key={q}
                      href={`/support/docs?q=${encodeURIComponent(q)}`}
                      className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      {q}
                    </Link>
                  ))}
                </div>
              </form>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-8 pt-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {SUPPORT_LINKS.map((item, index) => (
              <BlurFade key={item.href} delay={0.04 + index * 0.04}>
                <Link href={item.href} className="group block h-full">
                  <MagicCard
                    className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5"
                    gradientFrom="#34d399"
                    gradientTo="#0f766e"
                    gradientColor="rgba(27, 152, 114, 0.1)"
                  >
                    {index === 0 ? (
                      <BorderBeam size={55} duration={7} colorFrom="#34d399" colorTo="#0f766e" />
                    ) : null}
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <item.Icon className="size-5 text-primary" />
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] font-medium">
                          {item.category}
                        </Badge>
                        <Badge className={cn("text-[10px]", TIER_BADGE[item.tier])}>
                          {item.tier}
                        </Badge>
                      </div>
                    </div>
                    <h2 className="mt-1 font-display text-lg font-semibold group-hover:text-primary">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      Open
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </MagicCard>
                </Link>
              </BlurFade>
            ))}
          </div>

          <BlurFade delay={0.1}>
            <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5">
              <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Common first paths
              </p>
              <div className="mt-4 min-h-[14rem]">
                <AnimatedList delay={1200} className="gap-2">
                  {STREAM.map((step) => (
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

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-4 text-center">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Need a human on this?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Tell us the endpoint, event, or form that isn&apos;t behaving. We&apos;ll debug with
              you and open a doc PR if the fix belongs there.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/contact">Contact support</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/support/changelog">Read changelog</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
