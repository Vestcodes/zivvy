import Link from "next/link";
import {
  ArrowLeft,
  CircleDollarSign,
  Copy,
  Download,
  Mail,
  MoreHorizontal,
  Printer,
  Send
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Invoice } from "@/lib/mock-invoice";
import { cn } from "@/lib/utils";

const CURRENCY = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const STATUS_BADGE: Record<Invoice["status"], string> = {
  Paid: "bg-primary/10 text-primary border-primary/20",
  Unpaid: "bg-secondary text-secondary-foreground border-transparent",
  Overdue: "bg-destructive/10 text-destructive border-destructive/20",
  Draft: "bg-muted text-muted-foreground border-transparent",
  Cancelled: "bg-muted text-muted-foreground/60 border-transparent"
};

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function fmtDate(v: string): string {
  const d = new Date(v);
  return d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function InvoiceHero({ invoice }: { invoice: Invoice }) {
  const daysOverdue = Math.floor(
    (Date.now() - new Date(invoice.due_date).getTime()) / 86400_000
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button asChild variant="ghost" size="icon-sm">
              <Link href="/sales/invoices">
                <ArrowLeft />
              </Link>
            </Button>
            <span>Invoices</span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
              {invoice.name}
            </h1>
            <Badge className={STATUS_BADGE[invoice.status]}>{invoice.status}</Badge>
            {invoice.status === "Overdue" && daysOverdue > 0 && (
              <span className="text-sm font-medium text-destructive">
                {daysOverdue} days late
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm">
            <Mail />
            Send reminder
          </Button>
          <Button variant="outline" size="sm">
            <Printer />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download />
            PDF
          </Button>
          <Button variant="polished" size="sm">
            <CircleDollarSign />
            Record payment
          </Button>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Customer card */}
          <Card className="border-border/70 bg-card shadow-sm">
            <CardContent className="flex items-start gap-4 py-5">
              <div className="bg-primary-gradient grid size-12 shrink-0 place-items-center rounded-md text-primary-foreground shadow-sm">
                <span className="font-display text-lg">{initialsOf(invoice.customer)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-display text-lg tracking-tight">
                  {invoice.customer}
                </h2>
                <p className="truncate text-sm text-muted-foreground">
                  {invoice.customer_email}
                </p>
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  <span>
                    Posted{" "}
                    <span className="tabular-nums text-foreground">
                      {fmtDate(invoice.posting_date)}
                    </span>
                  </span>
                  <span>
                    Due{" "}
                    <span
                      className={cn(
                        "tabular-nums",
                        invoice.status === "Overdue"
                          ? "text-destructive"
                          : "text-foreground"
                      )}
                    >
                      {fmtDate(invoice.due_date)}
                    </span>
                  </span>
                </div>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Outstanding
                </p>
                <p className="font-mono text-2xl font-medium tabular-nums text-destructive">
                  {invoice.currency} {CURRENCY.format(invoice.outstanding)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Line items */}
          <Card className="border-border/70 bg-card shadow-sm">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="font-display text-lg">Items</CardTitle>
              <span className="text-xs text-muted-foreground">
                {invoice.items.length} line
                {invoice.items.length === 1 ? "" : "s"}
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left">
                    <th className="px-6 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Item
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Qty
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Rate
                    </th>
                    <th className="px-6 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/40 last:border-b-0"
                    >
                      <td className="px-6 py-3">
                        <div className="font-medium">{item.item_code}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums">
                        {item.qty}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums">
                        {CURRENCY.format(item.rate)}
                      </td>
                      <td className="px-6 py-3 text-right font-mono tabular-nums">
                        {CURRENCY.format(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card className="border-border/70 bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {invoice.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card className="border-border/70 bg-card shadow-sm">
            <CardContent className="space-y-3 py-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono tabular-nums">
                  {CURRENCY.format(invoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-mono tabular-nums">
                  {CURRENCY.format(invoice.tax_amount)}
                </span>
              </div>
              <Separator />
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="font-mono text-2xl font-medium tabular-nums">
                  {invoice.currency} {CURRENCY.format(invoice.total)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-mono tabular-nums text-primary">
                  {CURRENCY.format(invoice.amount_paid)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Outstanding</span>
                <span
                  className={cn(
                    "font-mono tabular-nums",
                    invoice.outstanding > 0 ? "text-destructive" : "text-primary"
                  )}
                >
                  {CURRENCY.format(invoice.outstanding)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoice.activity.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/70" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-muted-foreground">{a.what}</span>
                    </p>
                    <p className="font-mono tabular-nums text-muted-foreground">
                      {a.at.replace("T", " · ")}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                <Send />
                Send
              </Button>
              <Button variant="outline" size="sm">
                <Copy />
                Duplicate
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
