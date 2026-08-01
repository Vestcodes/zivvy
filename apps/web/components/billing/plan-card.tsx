import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ZivvyBoot } from "@/lib/boot-types";

const TIER_LABEL: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business"
};

export function PlanCard({ zivvy }: { zivvy: ZivvyBoot }) {
  const seatsPct = zivvy.seats_allowed > 0
    ? Math.round((zivvy.seats_used / zivvy.seats_allowed) * 100)
    : 0;
  const renewsAt = zivvy.tenant?.current_period_end;

  return (
    <Card className="border-border/70 bg-card/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="font-display text-2xl">Current plan</CardTitle>
          <Badge
            className={
              zivvy.tier === "free"
                ? "bg-muted text-foreground border-transparent"
                : zivvy.tier === "pro"
                  ? "bg-primary-gradient text-primary-foreground border-transparent"
                  : "bg-foreground text-background border-transparent"
            }
          >
            {TIER_LABEL[zivvy.tier] ?? zivvy.tier}
          </Badge>
        </div>
        <CardDescription>
          {zivvy.subscription_status === "active"
            ? "Active subscription"
            : zivvy.subscription_status === "trialing"
              ? "In trial"
              : zivvy.subscription_status === "canceled"
                ? "Subscription canceled"
                : zivvy.subscription_status || "No active subscription"}
          {renewsAt && (
            <>
              {" · "}
              renews {new Date(renewsAt).toLocaleDateString()}
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm font-medium">Seats used</span>
          <span className="font-mono text-sm text-muted-foreground">
            {zivvy.seats_used} / {zivvy.seats_allowed}
          </span>
        </div>
        <Progress value={seatsPct} className="h-2" />
        {zivvy.tenant?.slug && (
          <p className="mt-4 text-xs text-muted-foreground">
            Tenant slug: <span className="font-mono">{zivvy.tenant.slug}</span>
            {zivvy.tenant.company && (
              <>
                {" · "}Company: <span>{zivvy.tenant.company}</span>
              </>
            )}
            {zivvy.tenant.datacenter && (
              <>
                {" · "}Region: <span className="uppercase">{zivvy.tenant.datacenter}</span>
              </>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
