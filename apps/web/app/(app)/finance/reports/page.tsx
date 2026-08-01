import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileDown,
  Landmark,
  Scale,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Finance reports — Zivvy",
  description: "Accounting reports and related finance lists."
};

const REPORTS = [
  {
    href: "/finance/accounts",
    title: "Chart of accounts",
    description: "Browse and manage your account tree.",
    icon: Landmark
  },
  {
    href: "/finance/journal",
    title: "Journal entries",
    description: "Manual journals and adjustments.",
    icon: BookOpen
  },
  {
    href: "/finance/payments",
    title: "Payment entries",
    description: "Incoming and outgoing payments.",
    icon: Wallet
  },
  {
    href: "/sales/invoices",
    title: "Sales invoices",
    description: "Customer invoices and receivables activity.",
    icon: BarChart3
  },
  {
    href: "/purchases/invoices",
    title: "Purchase invoices",
    description: "Supplier bills and payables activity.",
    icon: Scale
  },
  {
    href: "/billing",
    title: "Subscription & seats",
    description: "Your Zivvy plan and seat usage.",
    icon: ClipboardCheck
  },
  {
    href: "/finance/datev",
    title: "DATEV export",
    description: "Export GL entries in DATEV CSV format for your Steuerberater.",
    icon: FileDown
  }
] as const;

export default function FinanceReportsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Finance reports
        </h1>
        <p className="mt-2 text-muted-foreground">
          Jump into the finance lists and ledgers you use most.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {REPORTS.map(({ href, title, description, icon: Icon }) => (
          <Card key={href} className="border-border/70">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-md bg-secondary text-secondary-foreground">
                  <Icon className="size-4" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </div>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link href={href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
