import Link from "next/link";
import { AlertCircle, ArrowRight, Boxes, Clock, Receipt, PartyPopper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AttentionItem } from "@/lib/dashboard-data";

const ICON_BY_KIND: Record<AttentionItem["kind"], React.ElementType> = {
  "overdue-invoice": Receipt,
  "arriving-po": Clock,
  "low-stock": Boxes
};

const SEVERITY_STYLE: Record<AttentionItem["severity"], string> = {
  critical: "text-destructive",
  warning: "text-chart-2",
  info: "text-muted-foreground"
};

const SEVERITY_LABEL: Record<AttentionItem["severity"], string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info"
};

const SEVERITY_BADGE: Record<AttentionItem["severity"], string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  info: "bg-muted text-muted-foreground border-transparent"
};

export function DashboardAttention({
  items,
  className
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
              const Icon = ICON_BY_KIND[item.kind] ?? AlertCircle;
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
                    <Badge variant="outline" className={cn("shrink-0", SEVERITY_BADGE[item.severity])}>
                      {SEVERITY_LABEL[item.severity]}
                    </Badge>
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
