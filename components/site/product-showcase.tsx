"use client";

import Link from "next/link";
import {
  Banknote,
  Boxes,
  Code2,
  LineChart,
  PackageOpen,
  Puzzle,
  UsersRound,
} from "lucide-react";
import { BentoGrid, BentoGridItem } from "@/components/ui/aceternity";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Marquee } from "@/components/ui/marquee";
import { BlurFade } from "@/components/ui/blur-fade";
import { BrandLogo } from "@/components/site/brand-logo";
import { cn } from "@/lib/utils";

/* ---------- Reusable BentoGridItem headers (visuals) ---------- */

function GridPatternHeader() {
  return (
    <div className="relative flex h-full min-h-[6rem] w-full flex-1 overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background">
      <AnimatedGridPattern
        numSquares={26}
        maxOpacity={0.14}
        duration={3}
        className={cn(
          "pointer-events-none absolute inset-0 fill-primary/25 stroke-primary/30",
          "[mask-image:radial-gradient(240px_circle_at_20%_20%,white,transparent)]"
        )}
      />
      <div className="relative m-auto grid w-full max-w-sm gap-2 p-4 text-left">
        <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-sm shadow-sm">
          <span className="text-muted-foreground">Deal · </span>
          <span className="font-medium">Acme · $18,400</span>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-sm shadow-sm">
          <span className="text-muted-foreground">Stage · </span>
          <span className="font-medium">Negotiation → Won</span>
        </div>
      </div>
    </div>
  );
}

function ReconHeader() {
  return (
    <div className="relative flex h-full min-h-[6rem] w-full flex-1 overflow-hidden rounded-xl border border-border/60 bg-card/70">
      <div className="m-auto flex flex-col items-center gap-2">
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Unreconciled · 0
        </span>
        <p className="text-[11px] text-muted-foreground">Last sync 2m ago</p>
      </div>
    </div>
  );
}

function HrHeader() {
  return (
    <div className="relative flex h-full min-h-[6rem] w-full flex-1 overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-primary/10 to-background">
      <div className="m-auto flex -space-x-2">
        {["A", "R", "S", "M"].map((letter, i) => (
          <div
            key={letter}
            className={cn(
              "flex size-8 items-center justify-center rounded-full border-2 border-background text-xs font-medium",
              i === 0 && "bg-primary/70 text-primary-foreground",
              i === 1 && "bg-emerald-500/70 text-white",
              i === 2 && "bg-indigo-500/70 text-white",
              i === 3 && "bg-amber-500/70 text-white"
            )}
          >
            {letter}
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiHeader() {
  return (
    <div className="relative flex h-full min-h-[6rem] w-full flex-1 overflow-hidden rounded-xl border border-border/60 bg-slate-950 font-mono text-[11px] text-emerald-300">
      <div className="m-auto w-full px-4">
        <p className="text-slate-500">$ curl https://api.zivvy.xyz/v1</p>
        <p className="mt-1 text-emerald-300">200 OK · signed</p>
      </div>
    </div>
  );
}

const INTEGRATION_LOGOS = [
  "slack",
  "stripe",
  "hubspot",
  "shopify",
  "quickbooks",
  "zapier",
  "googledrive",
  "salesforce",
  "notion",
  "github",
];

function IntegrationsHeader() {
  return (
    <div className="relative flex h-full min-h-[6rem] w-full flex-1 items-center overflow-hidden rounded-xl border border-border/60 bg-card/70 py-2">
      <Marquee pauseOnHover className="[--duration:22s]">
        {INTEGRATION_LOGOS.map((slug) => (
          <span
            key={slug}
            className="mx-2 flex size-10 items-center justify-center rounded-md border border-border/70 bg-background/70"
          >
            <BrandLogo slug={slug} className="size-8 text-muted-foreground" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}

function PosHeader() {
  return (
    <div className="relative flex h-full min-h-[6rem] w-full flex-1 overflow-hidden rounded-xl border border-border/60 bg-card/70">
      <div className="m-auto grid w-full max-w-[10rem] grid-cols-3 gap-1.5 p-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-md border border-border/60",
              i % 4 === 0
                ? "bg-primary/25"
                : i % 3 === 0
                ? "bg-emerald-500/20"
                : "bg-background/60"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function AddonHeader() {
  return (
    <div className="relative flex h-full min-h-[6rem] w-full flex-1 overflow-hidden rounded-xl border border-dashed border-border/70 bg-card/60">
      <p className="m-auto text-xs uppercase tracking-wide text-muted-foreground">
        + Add-ons marketplace
      </p>
    </div>
  );
}

const MODULES = [
  {
    title: "CRM & Sales",
    description:
      "Quotes, orders, invoices — one pipeline that stays out of the way of shipping.",
    href: "/features",
    icon: <LineChart className="size-4 text-primary" />,
    header: <GridPatternHeader />,
    className: "md:col-span-2",
  },
  {
    title: "Banking & Reconciliation",
    description:
      "Live bank feeds, auto-match, and an unreconciled count that stays at zero.",
    href: "/features",
    icon: <Banknote className="size-4 text-primary" />,
    header: <ReconHeader />,
    className: "md:col-span-1",
  },
  {
    title: "HR & Payroll",
    description:
      "People, leave, and payroll in one seat-based system. No add-on tax.",
    href: "/solutions/hr-teams",
    icon: <UsersRound className="size-4 text-primary" />,
    header: <HrHeader />,
    className: "md:col-span-1",
  },
  {
    title: "API & Webhooks",
    description:
      "130+ REST endpoints, HMAC-signed webhooks, 100+ event types. Read the docs →",
    href: "https://integrate.zivvy.xyz/docs",
    external: true,
    icon: <Code2 className="size-4 text-primary" />,
    header: <ApiHeader />,
    className: "md:col-span-2",
  },
  {
    title: "Integrations",
    description:
      "Bring Slack, Stripe, HubSpot and Shopify without gluing a spreadsheet.",
    href: "/integrations",
    icon: <Puzzle className="size-4 text-primary" />,
    header: <IntegrationsHeader />,
    className: "md:col-span-2",
  },
  {
    title: "Point of Sale",
    description:
      "Retail counter that shares stock, tax and customers with the rest of Zivvy.",
    href: "/features",
    icon: <PackageOpen className="size-4 text-primary" />,
    header: <PosHeader />,
    className: "md:col-span-1",
  },
  {
    title: "Add-ons",
    description: "Extend workflows without touching your core setup.",
    href: "/pricing",
    icon: <Boxes className="size-4 text-primary" />,
    header: <AddonHeader />,
    className: "md:col-span-3",
  },
];

export function ProductShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <BlurFade>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything your team needs. Nothing more.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Seven modules that share one data model. Modules unlock as you
            grow — Free, Pro, Business.
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={0.1}>
        <BentoGrid className="mt-12 md:auto-rows-[16rem]">
          {MODULES.map((mod) => {
            const inner = (
              <BentoGridItem
                key={mod.title}
                title={mod.title}
                description={mod.description}
                header={mod.header}
                icon={mod.icon}
                className={cn(
                  "border-border/70 bg-card/70 backdrop-blur cursor-pointer",
                  mod.className
                )}
              />
            );
            return mod.external ? (
              <a
                key={mod.title}
                href={mod.href}
                target="_blank"
                rel="noopener noreferrer"
                className="contents"
              >
                {inner}
              </a>
            ) : (
              <Link key={mod.title} href={mod.href} className="contents">
                {inner}
              </Link>
            );
          })}
        </BentoGrid>
      </BlurFade>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Prefer a full list?{" "}
        <Link
          href="/features"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Browse all features
        </Link>
      </p>
    </section>
  );
}
