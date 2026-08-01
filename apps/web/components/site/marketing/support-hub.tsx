"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  ExternalLink,
  LifeBuoy,
  MessageCircle,
  Rocket,
  ScrollText,
  Search
} from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Input } from "@/components/ui/input";
import { MagicCard } from "@/components/ui/magic-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

const Spotlight = dynamic(
  () => import("@/components/ui/aceternity/spotlight").then((m) => m.Spotlight),
  { ssr: false }
);

type Tier = "Free" | "Pro" | "Business";

const TIER_BADGE: Record<Tier, string> = {
  Free: "bg-muted text-foreground border-transparent",
  Pro: "bg-primary-gradient text-primary-foreground border-transparent",
  Business: "bg-foreground text-background border-transparent"
};

type SupportSurface = {
  title: string;
  href: string;
  description: string;
  Icon: React.ElementType;
  category: string;
  tier: Tier;
  external?: boolean;
  className: string;
  emphasis?: boolean;
};

const SUPPORT_BENTO: SupportSurface[] = [
  {
    title: "Documentation",
    href: "/support/docs",
    description:
      "Getting started, /api reference, webhook events, tenant configuration, and troubleshooting.",
    Icon: BookOpen,
    category: "Docs",
    tier: "Free",
    className: "sm:col-span-3 lg:col-span-2 lg:row-span-2"
  },
  {
    title: "API reference",
    href: "https://integrate.zivvy.xyz/docs",
    description:
      "Every REST resource, every webhook event — with request examples, replay + retry semantics, and OpenAPI at integrate.zivvy.xyz/docs.",
    Icon: Code2,
    category: "Developer",
    tier: "Free",
    external: true,
    emphasis: true,
    className: "sm:col-span-3 lg:col-span-2"
  },
  {
    title: "Guides",
    href: "/support/help-center",
    description:
      "Answers for billing, seat management, tenant migration, security, and technical incidents.",
    Icon: LifeBuoy,
    category: "Support",
    tier: "Pro",
    className: "sm:col-span-2 lg:col-span-1"
  },
  {
    title: "Changelog",
    href: "/support/changelog",
    description: "Endpoint changes, webhook payload updates, and feature launches per release.",
    Icon: ScrollText,
    category: "Releases",
    tier: "Free",
    className: "sm:col-span-1 lg:col-span-1"
  },
  {
    title: "Roadmap",
    href: "/support/roadmap",
    description:
      "What we are building now, next, and later — with API and webhook impact called out.",
    Icon: Rocket,
    category: "Roadmap",
    tier: "Free",
    className: "sm:col-span-2 lg:col-span-2"
  },
  {
    title: "Contact",
    href: "/contact",
    description:
      "Tell us the endpoint, event, or form that isn’t behaving. We’ll debug with you and open a doc PR if the fix belongs there.",
    Icon: MessageCircle,
    category: "Contact",
    tier: "Pro",
    className: "sm:col-span-1 lg:col-span-2"
  }
];

const QUICK_QUERIES = [
  "How do I rotate a webhook secret?",
  "Set up multi-tenant SSO",
  "Reconcile a Stripe payout",
  "Export /invoices to my ledger",
  "Turn on manufacturing on my tenant"
];

function BentoTile({ item, index }: { item: SupportSurface; index: number }) {
  const inner = (
    <MagicCard
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5",
        item.emphasis && "border-primary/40 shadow-lg shadow-primary/10"
      )}
      gradientFrom={item.emphasis ? "#22d3ee" : "#34d399"}
      gradientTo={item.emphasis ? "#0ea5e9" : "#0f766e"}
      gradientColor={
        item.emphasis ? "rgba(14,165,233,0.12)" : "rgba(27, 152, 114, 0.1)"
      }
    >
      {item.emphasis || index === 0 ? (
        <BorderBeam
          size={item.emphasis ? 90 : 55}
          duration={item.emphasis ? 6 : 8}
          colorFrom={item.emphasis ? "#22d3ee" : "#34d399"}
          colorTo={item.emphasis ? "#0ea5e9" : "#0f766e"}
        />
      ) : null}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg border border-border/60 bg-background/70",
            item.emphasis && "border-primary/40 bg-primary/10"
          )}
        >
          <item.Icon className="size-5 text-primary" />
        </div>
        <div className="flex items-center gap-1.5">
          {item.external ? (
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 text-[10px] font-medium text-primary"
            >
              integrate.zivvy.xyz
            </Badge>
          ) : null}
          <Badge variant="outline" className="text-[10px] font-medium">
            {item.category}
          </Badge>
          <Badge className={cn("text-[10px]", TIER_BADGE[item.tier])}>{item.tier}</Badge>
        </div>
      </div>
      <h2 className="mt-1 font-display text-lg font-semibold group-hover:text-primary">
        {item.title}
      </h2>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{item.description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        {item.external ? "Open API reference" : "Open"}
        {item.external ? (
          <ExternalLink className="size-4 transition-transform group-hover:translate-x-0.5" />
        ) : (
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        )}
      </span>
    </MagicCard>
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className="group block h-full"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={item.href} className={cn("group block h-full", item.className)}>
      {inner}
    </Link>
  );
}

export function SupportHubPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative">
          <Spotlight
            className="relative w-full"
            fill="color-mix(in oklab, var(--primary) 40%, transparent)"
          >
            <div className="relative mx-auto max-w-4xl px-6 pb-10 pt-20 text-center sm:pt-24">
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
                  Search docs, changelog, and roadmap in the same tenant model you&apos;ll use
                  in-product. No login required.
                </p>
              </BlurFade>

              <BlurFade delay={0.1}>
                <form
                  action="/support/docs"
                  method="get"
                  className="relative mx-auto mt-8 max-w-xl"
                >
                  <label htmlFor="support-search" className="sr-only">
                    Search support
                  </label>
                  <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-background/80 p-1 shadow-xl shadow-primary/10 backdrop-blur">
                    <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={10} />
                    <div className="relative flex items-center">
                      <Search className="pointer-events-none absolute left-4 size-4 text-muted-foreground" />
                      <Input
                        id="support-search"
                        name="q"
                        type="search"
                        placeholder="Search docs, endpoints, webhook events…"
                        className="!h-11 w-full !border-transparent !bg-transparent !pl-11 !pr-2 !text-sm !shadow-none focus-visible:!ring-0 focus-visible:!border-transparent"
                      />
                      <button
                        type="submit"
                        className="mx-1 my-1 shrink-0 rounded-xl bg-primary-gradient px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                      >
                        Search
                      </button>
                    </div>
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
          </Spotlight>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-4 pt-4">
          <BlurFade>
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  Support surfaces
                </h2>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Docs, API reference, guides, and a way to talk to a human. The API reference lives
                  at{" "}
                  <a
                    href="https://integrate.zivvy.xyz/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    integrate.zivvy.xyz/docs
                  </a>
                  .
                </p>
              </div>
              <Button asChild variant="polished">
                <a href="https://integrate.zivvy.xyz/docs" target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Open API docs
                </a>
              </Button>
            </div>
          </BlurFade>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:auto-rows-[minmax(11rem,auto)] lg:grid-cols-4">
            {SUPPORT_BENTO.map((item, index) => (
              <BlurFade key={item.title} delay={0.04 + index * 0.04} className={item.className}>
                <BentoTile item={item} index={index} />
              </BlurFade>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-10 text-center">
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
