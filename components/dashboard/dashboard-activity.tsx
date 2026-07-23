import Link from "next/link";
import { ArrowRight, CircleDollarSign, Inbox, PackageCheck, Receipt as ReceiptIcon, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/lib/dashboard-data";

const ICON_BY_KIND: Record<ActivityItem["kind"], React.ElementType> = {
  payment: CircleDollarSign,
  delivery: PackageCheck,
  lead: UserPlus,
  invoice: ReceiptIcon
};

export function DashboardActivity({
  items,
  className
}: {
  items: ActivityItem[];
  className?: string;
}) {
  return (
    <Card className={cn("border-border/70 bg-card shadow-sm", className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="font-display text-lg">Recent activity</CardTitle>
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
            <div className="grid size-10 place-items-center rounded-full bg-secondary text-muted-foreground">
              <Inbox className="size-5" />
            </div>
            <p className="mt-2 text-sm font-medium">No activity yet</p>
            <p className="text-xs text-muted-foreground">
              Recent payments, orders, and leads will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {items.map((item, i) => {
              const Icon = ICON_BY_KIND[item.kind] ?? Inbox;
              return (
                <li key={`${item.kind}-${i}`}>
                  <Link
                    href={item.href}
                    className="flex items-start gap-3 px-6 py-3 transition-colors hover:bg-secondary/70"
                  >
                    <div className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-muted-foreground"> · {item.detail}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{item.when}</p>
                    </div>
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
