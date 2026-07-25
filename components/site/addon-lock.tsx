import Link from "next/link";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";

interface AddonLockProps {
  addonSlug: string;
  addonTitle: string;
  addonPrice: number;
  moduleName: string;
  currency?: string;
  description?: string;
}

/**
 * Reusable upsell shown when a feature is behind an add-on the tenant
 * has not subscribed to. Drops in as an empty state on module pages.
 */
export function AddonLock({
  addonSlug,
  addonTitle,
  addonPrice,
  moduleName,
  currency = "USD",
  description,
}: AddonLockProps) {
  const href = `/settings/addons?highlight=${encodeURIComponent(addonSlug)}`;
  const price = formatMoney(addonPrice, currency);

  return (
    <div className="mx-auto w-full max-w-2xl py-8 sm:py-12">
      <Card className="border-border/70 bg-gradient-to-b from-card to-card/40">
        <CardContent className="flex flex-col items-center gap-5 px-6 py-10 text-center sm:py-14">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <Sparkles className="absolute -right-2 -top-2 h-4 w-4 text-primary/60" />
          </div>

          <Badge variant="secondary" className="text-xs">
            Add-on required
          </Badge>

          <div className="space-y-2 max-w-md">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {moduleName} is part of {addonTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              {description ??
                `Subscribe to the ${addonTitle} add-on to unlock ${moduleName} and everything that comes with it.`}
            </p>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-semibold tracking-tight">{price}</span>
            <span className="text-sm text-muted-foreground">/ month</span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild size="lg">
              <Link href={href}>
                Subscribe to {addonTitle}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/settings/addons">Browse all add-ons</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Billed monthly. Cancel anytime from{" "}
            <Link
              href="/billing"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Billing
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
