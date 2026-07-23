import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  Barcode,
  Boxes,
  Factory,
  Handshake,
  LineChart,
  PackageSearch,
  Receipt,
  ScanLine,
  ShieldCheck,
  UsersRound,
  Workflow
} from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Features — Zivvy",
  description: "One product for sales, stock, accounting, HR, projects, and manufacturing."
};

const TIERS = [
  {
    tier: "Free",
    tagline: "Start selling. Track basics.",
    features: [
      { icon: Receipt, title: "Quotes & sales orders", desc: "Send professional quotes, convert to orders in one click." },
      { icon: Handshake, title: "CRM lite", desc: "Leads, contacts, opportunities. Simple pipeline." },
      { icon: PackageSearch, title: "Basic stock", desc: "Items, warehouses, and stock levels. No serial/batch." }
    ]
  },
  {
    tier: "Pro",
    tagline: "Run a real business. All the essentials.",
    features: [
      { icon: Banknote, title: "Accounting & tax", desc: "Books, GST/VAT, invoices, payments, reconciliation." },
      { icon: Boxes, title: "Full stock", desc: "Warehouses, batches, serials, transfers, reconciliation." },
      { icon: UsersRound, title: "HR & payroll", desc: "Employees, attendance, leave, salary structures." },
      { icon: Barcode, title: "Barcode workflows", desc: "Scan-driven picking, receiving, and cycle counts." },
      { icon: Workflow, title: "Projects", desc: "Tasks, timesheets, budgets, gantt. Stay on top of delivery." },
      { icon: LineChart, title: "Reports & dashboards", desc: "The 6 reports you actually need, out of the box." }
    ]
  },
  {
    tier: "Business",
    tagline: "Scale operations. Manufacturing-grade.",
    features: [
      { icon: Factory, title: "Manufacturing & BOMs", desc: "Multi-level BOMs, work orders, job cards, shop floor." },
      { icon: ScanLine, title: "Assets", desc: "Fixed assets, depreciation, maintenance, movements." },
      { icon: ShieldCheck, title: "Quality", desc: "Inspection templates, holds, non-conformance workflows." },
      { icon: Workflow, title: "Subcontracting", desc: "Work with vendors on components, track their WIP." }
    ]
  }
];

const TIER_BADGE: Record<string, string> = {
  Free: "bg-muted text-foreground border-transparent",
  Pro: "bg-primary-gradient text-primary-foreground border-transparent",
  Business: "bg-foreground text-background border-transparent"
};

export default function FeaturesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-3xl px-6 pt-20 pb-4 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Everything, without the enterprise pain
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            One product, three tiers. Everything is here from day one — you pay for what you turn on.
          </p>
        </section>

        <div className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:pb-24">
          {TIERS.map(({ tier, tagline, features }) => (
            <div key={tier} className="mt-14 first:mt-0">
              <div className="mb-6 flex flex-wrap items-baseline gap-3">
                <Badge className={TIER_BADGE[tier]}>{tier}</Badge>
                <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  {tagline}
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {features.map(({ icon: Icon, title, desc }) => (
                  <Card
                    key={title}
                    className="border-border/70 bg-card/60 backdrop-blur"
                  >
                    <CardHeader>
                      <Icon className="size-5 text-primary" />
                      <CardTitle className="mt-2 font-display text-base">
                        {title}
                      </CardTitle>
                      <CardDescription>{desc}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Ready to try Zivvy?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Free plan, 2 seats. No credit card. Change your mind whenever.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="polished" size="lg" className="h-12 px-6">
              <Link href="/login#signup">Start free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-6">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
