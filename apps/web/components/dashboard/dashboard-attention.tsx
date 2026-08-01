import Link from "next/link";
import { AlertCircle, ArrowRight, PartyPopper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { iconForKind } from "@/lib/dashboard-icons";
import type { StatusTone } from "@/lib/status";
import type { AttentionItem } from "@/lib/dashboard-data";

const SEVERITY_STYLE: Record<AttentionItem["severity"], string> = {
  critical: "text-destructive",
  warning: "text-chart-2",
  info: "text-muted-foreground",
};

const SEVERITY_TONE: Record<AttentionItem["severity"], StatusTone> = {
  critical: "danger",
  warning: "warning",
  info: "info",
};

const SEVERITY_LABEL: Record<AttentionItem["severity"], string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
};

export function DashboardAttention({
  items,
  className,
}: {
  items: AttentionItem[];
  className?: string;
}) {
  return (
    <Card className={cn("border-border/70 bg-card shadow-sm", className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="font-display text-lg">
          <span className="inline-flex items-center gap-2">
            <AlertCircle className="size-4" />
            Needs your attention
          </span>
        </CardTitle>
        {items.length > 0 && (
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href="/sales/invoices">
              View all
              <ArrowRight />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className={items.length > 0 ? "p-0" : ""}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="grid size-10 place-items-center rounded-full bg-secondary text-primary">
              <PartyPopper className="size-5" />
            </div>
            <p className="mt-2 text-sm font-medium">Nothing urgent</p>
            <p className="text-xs text-muted-foreground">
              No overdue invoices or arriving POs today.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {items.map((item, i) => {
              const Icon = iconForKind(item.kind);
              return (
                <li key={`${item.kind}-${i}`}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 px-6 py-3 transition-colors hover:bg-secondary/70"
                  >
                    <div
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-md bg-secondary",
                        SEVERITY_STYLE[item.severity]
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.meta}</p>
                    </div>
                    <StatusBadge
                      status={SEVERITY_LABEL[item.severity]}
                      tone={SEVERITY_TONE[item.severity]}
                      className="shrink-0"
                    />
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
