"use client";

import Link from "next/link";
import {
  Banknote,
  Boxes,
  Factory,
  LineChart,
  Receipt,
  UsersRound
} from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    Icon: Receipt,
    name: "Sales & CRM",
    description: "Quotes, orders, invoices — pipeline that stays out of the way.",
    href: "/features",
    cta: "Explore features",
    className: "col-span-3 lg:col-span-1",
    background: (
      <AnimatedGridPattern
        numSquares={20}
        maxOpacity={0.08}
        className="absolute inset-0 fill-primary/10 stroke-primary/15 [mask-image:radial-gradient(300px_circle_at_0%_0%,white,transparent)]"
      />
    )
  },
  {
    Icon: Boxes,
    name: "Stock & inventory",
    description: "Warehouses, batches, serials with live reconciliation.",
    href: "/features",
    cta: "See stock",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 80% 20%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 70%)"
        }}
      />
    )
  },
  {
    Icon: Banknote,
    name: "Accounting",
    description: "Books, tax, payments — sane defaults per region.",
    href: "/pricing",
    cta: "View plans",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 10% 80%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 70%)"
        }}
      />
    )
  },
  {
    Icon: UsersRound,
    name: "HR & payroll",
    description: "Employees, leave, payroll. Seat-aware from day one.",
    href: "/solutions/hr-teams",
    cta: "HR solutions",
    className: "col-span-3 lg:col-span-1",
    background: <div className="absolute inset-0 bg-muted/30" />
  },
  {
    Icon: Factory,
    name: "Manufacturing",
    description: "BOMs, work orders, job cards on Business.",
    href: "/product-tour",
    cta: "Watch tour",
    className: "col-span-3 lg:col-span-1",
    background: <div className="absolute inset-0 bg-primary/5" />
  },
  {
    Icon: LineChart,
    name: "Reports that answer",
    description: "The dashboards you opened the app to check.",
    href: "/features/reporting-dashboard",
    cta: "Reporting",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedGridPattern
        numSquares={16}
        maxOpacity={0.1}
        className="absolute inset-0 fill-primary/10 stroke-primary/20 [mask-image:linear-gradient(to_top,transparent_20%,white)]"
      />
    )
  }
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <BlurFade>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything your team needs. Nothing more.
          </h2>
          <p className="mt-4 text-muted-foreground">
            The clean way to run everyday work across sales, stock, and finance.
            Modules unlock as you grow — Free → Pro → Business when you actually need more.
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} className="mt-12">
        <BentoGrid className="auto-rows-[14rem] lg:auto-rows-[16rem]">
          {FEATURES.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </BlurFade>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Prefer a full list?{" "}
        <Link href="/features" className={cn("font-medium text-primary underline-offset-4 hover:underline")}>
          Browse all features
        </Link>
      </p>
    </section>
  );
}
