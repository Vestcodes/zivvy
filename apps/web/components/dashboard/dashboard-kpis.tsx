import { ArrowDownRight, ArrowRight, ArrowUpRight, DollarSign, Receipt, AlertTriangle, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { KpiData } from "@/lib/dashboard-data";

interface KpiProps {
  data: KpiData;
  currency?: string;
}

interface KpiTile {
  label: string;
  value: string;
  delta: string;
  deltaKind: "positive" | "negative" | "neutral";
  deltaLabel: string;
  icon: React.ElementType;
}

const currencyFmt = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

function buildTiles({ data, currency = "$" }: KpiProps): KpiTile[] {
  const revDeltaPct = data.revenue.deltaPct;
  const outDelta = 0;
  const leadDelta = data.leads.delta;
  return [
    {
      label: "Revenue this month",
      value: `${currency}${currencyFmt.format(Math.round(data.revenue.current))}`,
      delta:
        revDeltaPct === null
          ? "New"
          : `${revDeltaPct >= 0 ? "+" : ""}${revDeltaPct}%`,
      deltaKind:
        revDeltaPct === null ? "neutral" : revDeltaPct >= 0 ? "positive" : "negative",
      deltaLabel: "vs last month",
      icon: DollarSign
    },
    {
      label: "Outstanding invoices",
      value: `${currency}${currencyFmt.format(Math.round(data.outstanding))}`,
      delta: data.outstanding > 0 ? "Open" : "Clear",
      deltaKind: data.outstanding > 0 ? "negative" : "positive",
      deltaLabel: data.outstanding > 0 ? "action needed" : "nothing due",
      icon: Receipt
    },
    {
      label: "Stock alerts",
      value: String(data.stockAlerts),
      delta: data.stockAlerts > 0 ? "Attention" : "Healthy",
      deltaKind: data.stockAlerts > 0 ? "negative" : "positive",
      deltaLabel: data.stockAlerts > 0 ? "reorder items" : "no reorders",
      icon: AlertTriangle
    },
    {
      label: "New leads",
      value: String(data.leads.current),
      delta:
        leadDelta === 0
          ? "="
          : `${leadDelta > 0 ? "+" : ""}${leadDelta}`,
      deltaKind: leadDelta >= 0 ? "positive" : "negative",
      deltaLabel: "vs last week",
      icon: UserPlus
    }
  ];
}

export function DashboardKpis(props: KpiProps) {
  const tiles = buildTiles(props);
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((k) => {
        const Icon = k.icon;
        const positive = k.deltaKind === "positive";
        const negative = k.deltaKind === "negative";
        return (
          <Card key={k.label} className="border-border/70 bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {k.label}
                  </p>
                  <p className="mt-2 font-mono text-2xl font-medium tabular-nums">
                    {k.value}
                  </p>
                </div>
                <div className="grid size-9 place-items-center rounded-md bg-secondary text-secondary-foreground">
                  <Icon className="size-4" />
                </div>
              </div>
              <div
                className={cn(
                  "mt-3 flex items-center gap-1 text-xs",
                  positive && "text-primary",
                  negative && "text-destructive",
                  !positive && !negative && "text-muted-foreground"
                )}
              >
                {positive && <ArrowUpRight className="size-3.5" />}
                {negative && <ArrowDownRight className="size-3.5" />}
                {!positive && !negative && <ArrowRight className="size-3.5" />}
                <span className="font-mono tabular-nums">{k.delta}</span>
                <span className="text-muted-foreground">· {k.deltaLabel}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
